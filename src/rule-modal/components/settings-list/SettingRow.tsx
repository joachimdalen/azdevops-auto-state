import { Toggle } from 'azure-devops-ui/Toggle';

import { SettingRow, SettingRowToggle } from './types';

const SettingRow = ({
  settings,
  toggle
}: {
  settings: SettingRow<SettingRowToggle>;
  toggle: (key: string, value: boolean) => Promise<void>;
}): JSX.Element => {
  return (
    <div className="flex-row padding-vertical-8 padding-horizontal-8">
      <div className="flex-column padding-right-16">
        <Toggle
          onText="On"
          offText="Off"
          text="Hello"
          onChange={(e, c) => {
            toggle('root', c);
          }}
          checked={settings.checked}
          {...settings.toggleProps}
        />
      </div>
      <div className="flex-column flex-grow margin-left-8 padding-horizontal-16">
        <div className="flex-row flex-wrap">
          <div className="flex-column flex-grow">
            <h3 className="body-m margin-0 flex-row">
              <span className="icon-margin">{settings.title}</span>
            </h3>
            {settings.description && (
              <div className="body-s">
                <div className="secondary-text">{settings.description}</div>
              </div>
            )}
          </div>
        </div>

        {settings.checked && settings.options && (
          <div className="flex-column rhythm-vertical-16">
            <div className="padding-top-16">
              <div className="flex-row">
                <div className="flex-column rhythm-vertical-16">
                  {settings.options.map(s => {
                    return (
                      <div className="body-m flex-center flex-row" key={s.id}>
                        <Toggle checked={s.checked} onChange={(e, c) => toggle(s.id, c)} />
                        <div className="secondary-text">{s.title}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingRow;
