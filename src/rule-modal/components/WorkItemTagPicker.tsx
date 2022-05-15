import { ExtendedWorkItemTrackingRestClient } from '@joachimdalen/azdevops-ext-core/ExtendedWorkItemTrackingRestClient';
import { getClient } from 'azure-devops-extension-api';
import { WorkItemTagDefinition } from 'azure-devops-extension-api/WorkItemTracking';
import { useObservableArray } from 'azure-devops-ui/Core/Observable';
import { ISuggestionItemProps } from 'azure-devops-ui/SuggestionsList';
import { TagPicker } from 'azure-devops-ui/TagPicker';
import { useEffect, useState } from 'react';

import DevOpsService from '../../common/services/DevOpsService';
import { getTagsAsList } from '../../common/workItemUtils';

interface WorkItemTagPicker {
  selected?: string;
  onChange: (val: string) => void;
}
export const WorkItemTagPicker = ({
  selected,
  onChange
}: WorkItemTagPicker): React.ReactElement => {
  const [allTags, setAllTags] = useObservableArray<WorkItemTagDefinition>([]);
  const [tagItems, setTagItems] = useObservableArray<WorkItemTagDefinition>([]);
  const [suggestions, setSuggestions] = useObservableArray<WorkItemTagDefinition>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const client = getClient(ExtendedWorkItemTrackingRestClient);
      const devopsService = new DevOpsService();
      const project = await devopsService.getProject();
      if (project) {
        const tags = await client.getWorkItemTags(project.id);

        if (selected !== undefined) {
          const selectedTagNames = getTagsAsList(selected);
          const selectedTags = tags.filter(x => selectedTagNames.includes(x.name));
          const notSeleted = tags.filter(x => !selectedTagNames.includes(x.name));
          setTagItems(selectedTags);
          setAllTags(notSeleted);
        } else {
          setAllTags(tags);
          setSuggestions(tags);
        }
      }
      setLoading(false);
    }

    init();
  }, []);

  const areTagsEqual = (a: WorkItemTagDefinition, b: WorkItemTagDefinition) => {
    return a.id === b.id;
  };

  const convertItemToPill = (tag: WorkItemTagDefinition) => {
    return {
      content: tag.name
    };
  };

  const onSearchChanged = (searchValue: string) => {
    setLoadingSuggestions(true);
    setSuggestions(
      allTags.value
        .filter(
          testItem =>
            tagItems.value.findIndex(testSuggestion => testSuggestion.id == testItem.id) === -1
        )
        .filter(testItem => testItem.name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1)
    );
    setLoadingSuggestions(false);
  };

  const onTagAdded = (tag: WorkItemTagDefinition) => {
    const newItems = [...tagItems.value, tag];
    setAllTags(prev => prev.filter(x => x.id !== tag.id));
    setTagItems(newItems);
    setSuggestions(prev => prev.filter(x => x.id !== tag.id));
    onChange(newItems.map(x => x.name).join(';'));
  };

  const onTagRemoved = (tag: WorkItemTagDefinition) => {
    const newItems = tagItems.value.filter(x => x.id !== tag.id);
    setAllTags(prev => [...prev, tag]);
    setSuggestions(prev => [...prev, tag]);
    setTagItems(newItems);
    onChange(newItems.map(x => x.name).join(';'));
  };

  const renderSuggestionItem = (tag: ISuggestionItemProps<WorkItemTagDefinition>) => {
    return <div className="body-m">{tag.item.name}</div>;
  };

  return (
    <div className="flex-column">
      <TagPicker
        areTagsEqual={areTagsEqual}
        convertItemToPill={convertItemToPill}
        noResultsFoundText={'No results found'}
        onSearchChanged={onSearchChanged}
        onTagAdded={onTagAdded}
        onTagRemoved={onTagRemoved}
        renderSuggestionItem={renderSuggestionItem}
        selectedTags={tagItems}
        suggestions={suggestions}
        suggestionsLoading={loadingSuggestions}
      />
    </div>
  );
};
