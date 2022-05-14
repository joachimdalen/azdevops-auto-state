import { getInitials, Persona, PersonaSize } from '@fluentui/react';
import { IInternalIdentity } from '@joachimdalen/azdevops-ext-core/CommonTypes';
import { Icon } from 'azure-devops-ui/Icon';
import { getScopedGroupParts } from 'azure-devops-ui/IdentityPicker';
import { useMemo } from 'react';

const PersonaDisplay = ({
  approver,
  large = false
}: {
  approver?: IInternalIdentity;
  large?: boolean;
}): JSX.Element => {
  const imageUrl = useMemo(() => {
    const baseUrl = localStorage.getItem('AS_HOST_URL');
    const url = baseUrl === null ? '' : baseUrl;
    const imageUrl = approver?.image?.startsWith(url)
      ? approver?.image
      : `${url}${approver?.image}`;
    return imageUrl;
  }, [approver]);

  if (approver === undefined) {
    return (
      <div className="secondary-text">
        <Icon iconName="Contact" />
        <span className="margin-left-8">Unknown</span>
      </div>
    );
  }

  const scoped = getScopedGroupParts(approver as any);

  return (
    <Persona
      text={large ? scoped?.name || approver.displayName : approver.displayName}
      secondaryText={scoped?.scope}
      size={large ? PersonaSize.size40 : PersonaSize.size24}
      imageInitials={getInitials(approver.displayName, false)}
      imageUrl={imageUrl}
      hidePersonaDetails={false}
    />
  );
};
export default PersonaDisplay;
