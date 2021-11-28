interface StateTagProps {
  color: string;
  text: string;
}

const StateTag = ({ color, text }: StateTagProps): React.ReactElement => {
  return (
    <div className="flex-row flex-center">
      <div
        style={{
          backgroundColor: `#${color}`,
          width: '10px',
          height: '10px',
          borderRadius: '50%'
        }}
      ></div>
      <span className="margin-left-16">{text}</span>
    </div>
  );
};
export default StateTag;
