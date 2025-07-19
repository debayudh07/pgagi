/*eslint-disable*/
'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ContentItem } from '../../types';
import { ContentCard } from './ContentCard';
import { useAppDispatch } from '../../hooks/redux';
import { reorderFeedItems } from '../../store/slices/contentSlice';

interface SortableContentCardProps {
  item: ContentItem;
  onAction?: (action: string, item: ContentItem) => void;
}

const SortableContentCard: React.FC<SortableContentCardProps> = ({ item, onAction }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <ContentCard item={item} onAction={onAction} />
    </div>
  );
};

interface ContentGridProps {
  items: ContentItem[];
  onAction?: (action: string, item: ContentItem) => void;
  enableDragDrop?: boolean;
  className?: string;
}

export const ContentGrid: React.FC<ContentGridProps> = ({
  items,
  onAction,
  enableDragDrop = false,
  className = '',
}) => {
  const dispatch = useAppDispatch();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        dispatch(reorderFeedItems({ oldIndex, newIndex }));
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-black/40 backdrop-blur-md border border-orange-500/30 rounded-lg p-8">
        <div className="text-6xl mb-4 animate-bounce">📭</div>
        <h3 className="text-lg font-black mb-2 text-white" style={{ textShadow: '1px 1px 0px #ff6600' }}>
          💥 NO CONTENT DETECTED!
        </h3>
        <p className="text-orange-400 font-bold">
          ⚡ Adjust your power settings or search the multiverse! 🌌
        </p>
      </div>
    );
  }

  const gridContent = (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {items.map((item) => (
        enableDragDrop ? (
          <SortableContentCard
            key={item.id}
            item={item}
            onAction={onAction}
          />
        ) : (
          <ContentCard
            key={item.id}
            item={item}
            onAction={onAction}
          />
        )
      ))}
    </div>
  );

  if (enableDragDrop) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
          {gridContent}
        </SortableContext>
      </DndContext>
    );
  }

  return gridContent;
};
