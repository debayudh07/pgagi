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
import { reorderFeedItems, reorderContentItems } from '../../store/slices/contentSlice';

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
  } = useSortable({ 
    id: item.id,
    transition: {
      duration: 250, // Smooth animation duration
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)', // Smooth easing
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    scale: isDragging ? 1.05 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="touch-none relative group"
    >
      {/* Drag Handle - only this element should have drag listeners */}
      <div
        {...attributes}
        {...listeners}
        className={`absolute top-2 left-2 z-20 bg-black/90 backdrop-blur-sm border-2 border-orange-500 rounded-lg p-2 cursor-grab active:cursor-grabbing transition-all duration-300 opacity-0 group-hover:opacity-100 ${
          isDragging ? 'opacity-100 scale-110' : 'hover:bg-orange-500/20 hover:scale-110'
        }`}
        title="Drag to reorder"
      >
        <div className="w-4 h-4 flex flex-col justify-center space-y-1">
          <div className="w-full h-0.5 bg-orange-500 rounded transition-all duration-200"></div>
          <div className="w-full h-0.5 bg-orange-500 rounded transition-all duration-200"></div>
          <div className="w-full h-0.5 bg-orange-500 rounded transition-all duration-200"></div>
        </div>
      </div>
      
      {/* Drag overlay indicator */}
      {isDragging && (
        <div className="absolute inset-0 bg-orange-500/20 border-2 border-orange-500 border-dashed rounded-lg z-10 animate-pulse" />
      )}
      
      <ContentCard item={item} onAction={onAction} />
    </div>
  );
};

interface ContentGridProps {
  items: ContentItem[];
  onAction?: (action: string, item: ContentItem) => void;
  enableDragDrop?: boolean;
  className?: string;
  contentType?: 'movies' | 'news' | 'music' | 'social' | 'feed';
}

export const ContentGrid: React.FC<ContentGridProps> = ({
  items,
  onAction,
  enableDragDrop = false,
  className = '',
  contentType = 'feed',
}) => {
  const dispatch = useAppDispatch();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before activating drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    // Temporarily disabled drag reordering to prevent Redux state errors
    console.log('ℹ️ ContentGrid: Drag reordering temporarily disabled');
    return;
    
    // TODO: Re-enable once Redux ordering is properly implemented
    // const { active, over } = event;
    // if (active.id !== over?.id) {
    //   const oldIndex = items.findIndex((item) => item.id === active.id);
    //   const newIndex = items.findIndex((item) => item.id === over?.id);
    //   if (oldIndex !== -1 && newIndex !== -1) {
    //     console.log(`🔄 ContentGrid: Reordering ${contentType} from ${oldIndex} to ${newIndex}`);
    //     if (contentType === 'feed') {
    //       dispatch(reorderFeedItems({ oldIndex, newIndex }));
    //     } else {
    //       dispatch(reorderContentItems({ 
    //         contentType, 
    //         oldIndex, 
    //         newIndex 
    //       }));
    //     }
    //   }
    // }
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
