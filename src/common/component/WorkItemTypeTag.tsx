import cx from 'classnames';
interface WorkItemTypeTagProps {
  iconUrl?: string;
  iconSize?: number;
  text?: string;
  classNames?: string;
}

const WorkItemTypeTag = ({
  iconUrl,
  text,
  classNames,
  iconSize = 20
}: WorkItemTypeTagProps): React.ReactElement => {
  return (
    <div className={cx('flex-row flex-center', classNames)}>
      {iconUrl && <img src={iconUrl} height={iconSize} />}
      <span className="margin-left-16">{text || 'Unknown'}</span>
    </div>
  );
};
export default WorkItemTypeTag;
