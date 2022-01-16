enum WorkItemReferenceNames {
  Epic = 'Microsoft.VSTS.WorkItemTypes.Epic',
  Feature = 'Microsoft.VSTS.WorkItemTypes.Feature',
  UserStory = 'Microsoft.VSTS.WorkItemTypes.UserStory',
  Task = 'Microsoft.VSTS.WorkItemTypes.Task',
  Issue = 'Microsoft.VSTS.WorkItemTypes.Issue',
  Impediment = 'Microsoft.VSTS.WorkItemTypes.Impediment',
  ProductBacklogItem = 'Microsoft.VSTS.WorkItemTypes.ProductBacklogItem'
}

enum ProcessNames {
  Unknwon = 'Unknown',
  Basic = 'Basic',
  Agile = 'Agile',
  Scrum = 'Scrum',
  Cmmi = 'CMMI'
}

const toProcessName = (key?: string): ProcessNames => {
  if (key === undefined) return ProcessNames.Unknwon;

  const lowerKey = key.toLowerCase();

  switch (lowerKey) {
    case 'basic':
      return ProcessNames.Basic;
    case 'agile':
      return ProcessNames.Agile;
    case 'scrum':
      return ProcessNames.Scrum;
    case 'cmmi':
      return ProcessNames.Cmmi;
  }

  return ProcessNames.Unknwon;
};

export { WorkItemReferenceNames, ProcessNames, toProcessName };
