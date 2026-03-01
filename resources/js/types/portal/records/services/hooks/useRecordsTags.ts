// hooks/useRecordsTags.ts

import { useState } from 'react';

export const useRecordsTags = (initialTags: string[] = []) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [customTags, setCustomTags] = useState<string>('');

  const handleTagSelect = (tag: string) => {
    const newTags = selectedTags.includes(tag) 
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag].slice(0, 10);
    setSelectedTags(newTags);
  };

  const handleAddCustomTag = () => {
    if (customTags.trim()) {
      const newTags = customTags.split(',').map(tag => tag.trim()).filter(tag => tag);
      const updatedTags = [...selectedTags, ...newTags]
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 10);
      setSelectedTags(updatedTags);
      setCustomTags('');
    }
  };

  return {
    selectedTags,
    setSelectedTags,
    customTags,
    setCustomTags,
    handleTagSelect,
    handleAddCustomTag,
  };
};