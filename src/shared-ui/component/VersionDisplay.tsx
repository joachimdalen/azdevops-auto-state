interface VersionDisplayProps {
  showExtensionVersion?: boolean;
  moduleVersion?: string;
}

const VersionDisplay = ({
  showExtensionVersion = true,
  moduleVersion
}: VersionDisplayProps): JSX.Element => {
  return (
    <div className="rhythm-horizontal-4">
      {showExtensionVersion && (
        <>
          <span>Extension Version:</span>
          <span className="font-weight-semibold">{process.env.EXTENSION_VERSION}</span>
          <span> | </span>
        </>
      )}
      <span>Module Version:</span>
      <span className="font-weight-semibold">{moduleVersion}</span>
    </div>
  );
};

export default VersionDisplay;
