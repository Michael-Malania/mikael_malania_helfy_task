import { useEffect, useRef, useState } from 'react';
import TaskItem from './TaskItem';

const SWIPE_THRESHOLD_PX = 40;
const FALLBACK_SETTLE_MS = 400;

function wrapIndex(index, length) {
  return ((index % length) + length) % length;
}

export default function TaskList({
  tasks,
  emptyMessage = 'No tasks found.',
  onEdit,
  onDelete,
  onToggle,
  mutatingId = null
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTaskId, setActiveTaskId] = useState(() =>
    tasks.length > 0 ? tasks[0].id : null
  );
  const [slidePhase, setSlidePhase] = useState('idle');

  const trackRef = useRef(null);
  const timerRef = useRef(null);
  const settlementTokenRef = useRef(0);
  const pendingDirectionRef = useRef(null);
  const touchStartXRef = useRef(null);

  function clearSlideTimer() {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => {
    return () => clearSlideTimer();
  }, []);

  const count = tasks.length;
  const preservedIndex =
    activeTaskId !== null
      ? tasks.findIndex((task) => task.id === activeTaskId)
      : -1;
  const safeIndex =
    count === 0
      ? 0
      : preservedIndex !== -1
        ? preservedIndex
        : Math.min(activeIndex, count - 1);

  useEffect(() => {
    // Cancel any mid-slide transition when the visible list changes so index and track stay aligned.
    clearSlideTimer();
    settlementTokenRef.current += 1;
    pendingDirectionRef.current = null;
    setSlidePhase('idle');

    if (tasks.length === 0) {
      setActiveIndex(0);
      setActiveTaskId(null);
      return;
    }

    if (activeTaskId !== null) {
      const existingIndex = tasks.findIndex((task) => task.id === activeTaskId);
      if (existingIndex !== -1) {
        setActiveIndex(existingIndex);
        return;
      }
    }

    const clampedIndex = Math.min(activeIndex, tasks.length - 1);
    setActiveIndex(clampedIndex);
    setActiveTaskId(tasks[clampedIndex].id);
  }, [tasks]);

  function isAnimationDisabled() {
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return true;
    }

    if (trackRef.current && typeof window !== 'undefined' && window.getComputedStyle) {
      const customDuration = window
        .getComputedStyle(trackRef.current)
        .getPropertyValue('--carousel-slide-duration')
        .trim();
      if (customDuration === '0s' || customDuration === '0ms') {
        return true;
      }
    }

    return false;
  }

  function finalizeSlide(expectedToken) {
    if (settlementTokenRef.current !== expectedToken) {
      return;
    }
    const direction = pendingDirectionRef.current;
    if (!direction) {
      return;
    }

    // Bump the token before updating state so transitionend and the fallback timer cannot settle twice.
    settlementTokenRef.current += 1;
    pendingDirectionRef.current = null;
    clearSlideTimer();

    if (tasks.length >= 2) {
      const step = direction === 'next' ? 1 : -1;
      const nextIndex = wrapIndex(safeIndex + step, tasks.length);
      setActiveIndex(nextIndex);
      setActiveTaskId(tasks[nextIndex].id);
    }

    setSlidePhase('idle');
  }

  function goToSlide(direction) {
    if (
      tasks.length < 2 ||
      slidePhase !== 'idle' ||
      pendingDirectionRef.current !== null
    ) {
      return;
    }

    if (isAnimationDisabled()) {
      const step = direction === 'next' ? 1 : -1;
      const nextIndex = wrapIndex(safeIndex + step, tasks.length);
      setActiveIndex(nextIndex);
      setActiveTaskId(tasks[nextIndex].id);
      return;
    }

    clearSlideTimer();
    const token = settlementTokenRef.current + 1;
    settlementTokenRef.current = token;
    pendingDirectionRef.current = direction;
    setSlidePhase(direction);

    timerRef.current = setTimeout(() => {
      finalizeSlide(token);
    }, FALLBACK_SETTLE_MS);
  }

  function handleTransitionEnd(event) {
    if (event.target !== trackRef.current || event.propertyName !== 'transform') {
      return;
    }
    finalizeSlide(settlementTokenRef.current);
  }

  function handleKeyDown(event) {
    const tag = event.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goToSlide('next');
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToSlide('prev');
    }
  }

  function handleTouchStart(event) {
    if (event.touches.length === 1) {
      touchStartXRef.current = event.touches[0].clientX;
    }
  }

  function handleTouchEnd(event) {
    if (touchStartXRef.current === null || event.changedTouches.length === 0) {
      return;
    }

    const deltaX = event.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (deltaX <= -SWIPE_THRESHOLD_PX) {
      goToSlide('next');
    } else if (deltaX >= SWIPE_THRESHOLD_PX) {
      goToSlide('prev');
    }
  }

  if (count === 0) {
    return (
      <div className="carousel-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const isLoopActive = count >= 2;
  const prevIndex = isLoopActive ? wrapIndex(safeIndex - 1, count) : 0;
  const nextIndex = isLoopActive ? wrapIndex(safeIndex + 1, count) : 0;

  const trackClassName = [
    'carousel-track',
    slidePhase === 'idle' ? 'carousel-track--idle' : 'carousel-track--sliding',
    slidePhase === 'next' ? 'carousel-track--next' : '',
    slidePhase === 'prev' ? 'carousel-track--prev' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className="carousel-wrapper"
      onKeyDown={handleKeyDown}
      aria-roledescription="carousel"
      aria-label="Task carousel"
    >
      <div className="carousel-controls">
        <button
          type="button"
          className="btn btn-secondary carousel-nav-btn"
          onClick={() => goToSlide('prev')}
          disabled={!isLoopActive}
          aria-disabled={!isLoopActive || slidePhase !== 'idle'}
          aria-label="Previous task"
        >
          Previous
        </button>

        <span className="carousel-counter" aria-live="polite">
          Task {safeIndex + 1} of {count}
        </span>

        <button
          type="button"
          className="btn btn-secondary carousel-nav-btn"
          onClick={() => goToSlide('next')}
          disabled={!isLoopActive}
          aria-disabled={!isLoopActive || slidePhase !== 'idle'}
          aria-label="Next task"
        >
          Next
        </button>
      </div>

      {!isLoopActive ? (
        <div className="carousel-single">
          <TaskItem
            task={tasks[0]}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
            isMutating={mutatingId === tasks[0].id}
          />
        </div>
      ) : (
        <div
          className="carousel-viewport"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            ref={trackRef}
            className={trackClassName}
            onTransitionEnd={handleTransitionEnd}
          >
            <div className="carousel-slot" key="slot-prev">
              <TaskItem
                task={tasks[prevIndex]}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggle={onToggle}
                isMutating={mutatingId === tasks[prevIndex].id}
                isInactive
              />
            </div>

            <div className="carousel-slot" key="slot-current">
              <TaskItem
                task={tasks[safeIndex]}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggle={onToggle}
                isMutating={mutatingId === tasks[safeIndex].id}
              />
            </div>

            <div className="carousel-slot" key="slot-next">
              <TaskItem
                task={tasks[nextIndex]}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggle={onToggle}
                isMutating={mutatingId === tasks[nextIndex].id}
                isInactive
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
