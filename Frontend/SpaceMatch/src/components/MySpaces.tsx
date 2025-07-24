import { useNavigate } from 'react-router-dom';
import SpaceList from './SpaceList';

const MySpaces = () => {
    const navigate = useNavigate();

    // Handlers for SpaceList actions
    const handleEditSpace = (spaceId: string) => {
        navigate(`/edit/${spaceId}`);
    };
    
    const handleManageSpace = (spaceId: string) => {
        navigate(`/manage/${spaceId}`);
    };
    
    const handleCreateSpace = () => {
        navigate('/create');
    };
    
    const handlePromoteSpace = (spaceId: string) => {
        navigate(`/promote/${spaceId}`);
    };

    return (
        <div className="my-spaces mt-8">
            <SpaceList
                onEditSpace={handleEditSpace}
                onManageSpace={handleManageSpace}
                onCreateSpace={handleCreateSpace}
                onPromoteSpace={handlePromoteSpace}
            />
        </div>
    );
};

export default MySpaces;
