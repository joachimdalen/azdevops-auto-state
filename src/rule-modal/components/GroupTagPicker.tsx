import { DevOpsService } from '@joachimdalen/azdevops-ext-core/DevOpsService';
import { ExtendedWorkItemTrackingRestClient } from '@joachimdalen/azdevops-ext-core/ExtendedWorkItemTrackingRestClient';
import { WorkItemService } from '@joachimdalen/azdevops-ext-core/WorkItemService';
import { getClient } from 'azure-devops-extension-api';
import { WorkItemTagDefinition } from 'azure-devops-extension-api/WorkItemTracking';
import { useObservableArray } from 'azure-devops-ui/Core/Observable';
import { ISuggestionItemProps } from 'azure-devops-ui/SuggestionsList';
import { ISelectedTagProps, TagPicker } from 'azure-devops-ui/TagPicker';
import { useEffect, useMemo, useState } from 'react';

import { getTagsAsList } from '../../common/workItemUtils';

interface GroupTagPickerProps {
  selected: string[];
  onChange: (val: string[]) => void;
}
export const GroupTagPicker = ({ selected, onChange }: GroupTagPickerProps): React.ReactElement => {
  const [allTags, setAllTags] = useObservableArray<string>([]);
  const [tagItems, setTagItems] = useObservableArray<string>([]);
  const [suggestions, setSuggestions] = useObservableArray<string>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [devOpsService] = useMemo(() => [new DevOpsService()], []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      // const client = getClient(ExtendedWorkItemTrackingRestClient);
      // const project = await devOpsService.getProject();
      //   if (project) {
      //     if (selected !== undefined) {
      //       const selectedTagNames = getTagsAsList(selected);
      //       const selectedTags = tags.filter(x => selectedTagNames.includes(x.name));
      //       const notSeleted = tags.filter(x => !selectedTagNames.includes(x.name));
      //       setTagItems(selectedTags);
      //       setAllTags(notSeleted);
      //     } else {
      //       setAllTags(tags);
      //       setSuggestions(tags);
      //     }
      //   }
      setLoading(false);
    }

    init();
  }, []);

  const areTagsEqual = (a: string, b: string): boolean => {
    return a === b;
  };

  const convertItemToPill = (tag: string): ISelectedTagProps => {
    return {
      content: tag
    };
  };

  const onSearchChanged = (searchValue: string) => {
    setLoadingSuggestions(true);
    setSuggestions(
      allTags.value
        .filter(
          testItem => tagItems.value.findIndex(testSuggestion => testSuggestion == testItem) === -1
        )
        .filter(testItem => testItem.toLowerCase().indexOf(searchValue.toLowerCase()) > -1)
    );
    setLoadingSuggestions(false);
  };

  const onTagAdded = (tag: string) => {
    const newItems = [...tagItems.value, tag];
    setAllTags(prev => prev.filter(x => x !== tag));
    setTagItems(newItems);
    setSuggestions(prev => prev.filter(x => x !== tag));
    onChange(newItems);
  };

  const onTagRemoved = (tag: string) => {
    const newItems = tagItems.value.filter(x => x !== tag);
    setAllTags(prev => [...prev, tag]);
    setSuggestions(prev => [...prev, tag]);
    setTagItems(newItems);
    onChange(newItems);
  };

  const renderSuggestionItem = (tag: ISuggestionItemProps<string>): JSX.Element => {
    return <div className="body-m">{tag.item}</div>;
  };

  return (
    <TagPicker
      areTagsEqual={areTagsEqual}
      convertItemToPill={convertItemToPill}
      noResultsFoundText={'No results found'}
      onSearchChanged={onSearchChanged}
      onTagAdded={onTagAdded}
      onTagRemoved={onTagRemoved}
      renderSuggestionItem={renderSuggestionItem}
      selectedTags={selected}
      suggestions={suggestions}
      suggestionsLoading={loadingSuggestions}
      createDefaultItem={val => val}
      onSearchChangedDebounceWait={100}
      placeholderText="Select or create rule group"
    />
  );
};
