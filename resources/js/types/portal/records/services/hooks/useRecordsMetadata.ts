// hooks/useRecordsMetadata.ts

import { useState } from 'react';
import { MetadataItem } from '@/types/records';

export const useRecordsMetadata = (initialMetadata: MetadataItem[] = []) => {
  const [metadataItems, setMetadataItems] = useState<MetadataItem[]>(initialMetadata);
  const [newMetadataKey, setNewMetadataKey] = useState('');
  const [newMetadataValue, setNewMetadataValue] = useState('');
  const [newMetadataType, setNewMetadataType] = useState<'string' | 'number' | 'boolean' | 'date'>('string');
  const [metadataInput, setMetadataInput] = useState<string>('{}');

  const addMetadataItem = (setData: (key: string, value: any) => void) => {
    if (newMetadataKey.trim() && newMetadataValue.trim()) {
      const newItem: MetadataItem = {
        key: newMetadataKey.trim(),
        value: newMetadataValue.trim(),
        type: newMetadataType,
      };
      
      const updatedItems = [...metadataItems, newItem];
      setMetadataItems(updatedItems);
      setNewMetadataKey('');
      setNewMetadataValue('');
      
      const metadataObj = updatedItems.reduce((acc, item) => {
        let parsedValue: any = item.value;
        
        switch (item.type) {
          case 'number':
            parsedValue = parseFloat(item.value) || 0;
            break;
          case 'boolean':
            parsedValue = item.value.toLowerCase() === 'true';
            break;
          case 'date':
            parsedValue = item.value;
            break;
          default:
            parsedValue = item.value;
        }
        
        acc[item.key] = parsedValue;
        return acc;
      }, {} as Record<string, any>);
      
      setData('metadata', metadataObj);
      setMetadataInput(JSON.stringify(metadataObj, null, 2));
    }
  };

  const removeMetadataItem = (index: number, setData: (key: string, value: any) => void) => {
    const updatedItems = metadataItems.filter((_, i) => i !== index);
    setMetadataItems(updatedItems);
    
    const metadataObj = updatedItems.reduce((acc, item) => {
      let parsedValue: any = item.value;
      
      switch (item.type) {
        case 'number':
          parsedValue = parseFloat(item.value) || 0;
          break;
        case 'boolean':
          parsedValue = item.value.toLowerCase() === 'true';
          break;
        case 'date':
          parsedValue = item.value;
          break;
        default:
          parsedValue = item.value;
      }
      
      acc[item.key] = parsedValue;
      return acc;
    }, {} as Record<string, any>);
    
    setData('metadata', metadataObj);
    setMetadataInput(JSON.stringify(metadataObj, null, 2));
  };

  const updateMetadataItem = (index: number, field: 'key' | 'value' | 'type', value: string, setData: (key: string, value: any) => void) => {
    const updatedItems = [...metadataItems];
    
    if (field === 'type') {
      updatedItems[index].type = value as 'string' | 'number' | 'boolean' | 'date';
    } else {
      updatedItems[index][field] = value;
    }
    
    setMetadataItems(updatedItems);
    
    const metadataObj = updatedItems.reduce((acc, item) => {
      let parsedValue: any = item.value;
      
      switch (item.type) {
        case 'number':
          parsedValue = parseFloat(item.value) || 0;
          break;
        case 'boolean':
          parsedValue = item.value.toLowerCase() === 'true';
          break;
        case 'date':
          parsedValue = item.value;
          break;
        default:
          parsedValue = item.value;
      }
      
      acc[item.key] = parsedValue;
      return acc;
    }, {} as Record<string, any>);
    
    setData('metadata', metadataObj);
    setMetadataInput(JSON.stringify(metadataObj, null, 2));
  };

  const handleJsonInputChange = (value: string, setData: (key: string, value: any) => void) => {
    setMetadataInput(value);
    try {
      const parsed = JSON.parse(value);
      setData('metadata', parsed);
      
      const items: MetadataItem[] = Object.entries(parsed).map(([key, value]) => {
        let type: 'string' | 'number' | 'boolean' | 'date' = 'string';
        
        if (typeof value === 'number') {
          type = 'number';
        } else if (typeof value === 'boolean') {
          type = 'boolean';
        } else if (typeof value === 'string' && !isNaN(Date.parse(value))) {
          type = 'date';
        }
        
        return {
          key,
          value: String(value),
          type,
        };
      });
      
      setMetadataItems(items);
    } catch {
      // Keep existing metadata if JSON is invalid
    }
  };

  return {
    metadataItems,
    setMetadataItems,
    newMetadataKey,
    setNewMetadataKey,
    newMetadataValue,
    setNewMetadataValue,
    newMetadataType,
    setNewMetadataType,
    metadataInput,
    setMetadataInput,
    addMetadataItem,
    removeMetadataItem,
    updateMetadataItem,
    handleJsonInputChange,
  };
};