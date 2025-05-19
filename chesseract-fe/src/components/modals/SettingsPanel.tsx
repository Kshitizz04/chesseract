import RightModalLayer from '@/components/modals/RightModalLayer';
import { useLayout } from '@/contexts/useLayout';

const SettingsPanel = () => {
    const {isSettingsPanelOpen,toggleSettingsPanel} = useLayout();
    
    return (
        <RightModalLayer
            isOpen={isSettingsPanelOpen}
            onClose={toggleSettingsPanel}
            title="Settings"
        >
            <div className="space-y-4">
                <p>This is the content of the modal.</p>
                <p>You can place any components here.</p>
            </div>
        </RightModalLayer>
    );
};
export default SettingsPanel;