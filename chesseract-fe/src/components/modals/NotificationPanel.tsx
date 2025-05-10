import RightModalLayer from '@/components/modals/RightModalLayer';
import { useLayout } from '@/utils/hooks/useLayout';

const NotificationPanel = () => {
    const {isNotificationPanelOpen,toggleNotificationPanel} = useLayout();
    
    return (
        <RightModalLayer
            isOpen={isNotificationPanelOpen}
            onClose={toggleNotificationPanel}
            title="Notifications"
        >
            <div className="space-y-4">
                <p>This is the content of the modal.</p>
                <p>You can place any components here.</p>
            </div>
        </RightModalLayer>
    );
};
export default NotificationPanel;