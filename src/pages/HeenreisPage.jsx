import React, { useState, useEffect, useRef } from 'react';
import { useRideContext } from '../context/RideContext';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  DndContext, 
  DragOverlay, 
  MouseSensor, 
  TouchSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { 
  Button, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  Alert,
  Tooltip,
  Box,
  Avatar,
  AvatarGroup
} from '@mui/material';
import { 
  FiUser,
  FiUserPlus,
  FiPlus,
  FiEdit2, 
  FiTrash2, 
  FiX,
  FiInfo,
  FiUsers,
  FiArrowRight
} from 'react-icons/fi';
import { FaCar, FaCarSide } from 'react-icons/fa';
import DraggableChild from '../components/DraggableChild';
import ChildDropZone from '../components/ChildDropZone';
import Car from '../components/Car';

const HeenreisPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { 
    currentTrip, 
    heenreisData, 
    loadTrip, 
    updateHeenreis,
    activeUsers,
    isUserActive
  } = useRideContext();
  
  // Lokale states voor dialogen en formulieren
  const [showCarDialog, setShowCarDialog] = useState(false);
  const [showChildDialog, setShowChildDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [carForm, setCarForm] = useState({ driver: '', capacity: 4 });
  const [childForm, setChildForm] = useState({ name: '' });
  const [activeChildId, setActiveChildId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [dragItem, setDragItem] = useState(null);
  
  // DND sensoren
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );
  
  // Effect om terug te navigeren als er geen huidige trip is
  useEffect(() => {
    if (!currentTrip) {
      navigate('/trips');
    }
  }, [currentTrip, navigate]);
  
  // Dialoog functies
  const handleOpenCarDialog = (car = null) => {
    if (car) {
      setIsEditing(true);
      setEditItem(car);
      setCarForm({
        driver: car.driver,
        capacity: car.capacity
      });
    } else {
      setIsEditing(false);
      setEditItem(null);
      setCarForm({ driver: '', capacity: 4 });
    }
    setShowCarDialog(true);
  };
  
  const handleOpenChildDialog = (child = null) => {
    if (child) {
      setIsEditing(true);
      setEditItem(child);
      setChildForm({
        name: child.name
      });
    } else {
      setIsEditing(false);
      setEditItem(null);
      setChildForm({ name: '' });
    }
    setShowChildDialog(true);
  };
  
  const handleCloseDialog = () => {
    setShowCarDialog(false);
    setShowChildDialog(false);
    setIsEditing(false);
    setEditItem(null);
  };
  
  // Auto en kind toevoegen/bewerken
  const handleSaveCar = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const updatedHeenreisData = { ...heenreisData };
      
      if (!updatedHeenreisData.cars) {
        updatedHeenreisData.cars = [];
      }
      
      if (isEditing && editItem) {
        // Auto bijwerken
        const carIndex = updatedHeenreisData.cars.findIndex(c => c.id === editItem.id);
        if (carIndex !== -1) {
          updatedHeenreisData.cars[carIndex] = {
            ...updatedHeenreisData.cars[carIndex],
            driver: carForm.driver,
            capacity: parseInt(carForm.capacity, 10) || 4
          };
        }
      } else {
        // Nieuwe auto toevoegen
        const newCar = {
          id: Date.now().toString(),
          driver: carForm.driver,
          capacity: parseInt(carForm.capacity, 10) || 4,
          assigned: []
        };
        updatedHeenreisData.cars.push(newCar);
      }
      
      await updateHeenreis(updatedHeenreisData);
      
      handleCloseDialog();
      setIsLoading(false);
    } catch (error) {
      console.error('Fout bij opslaan auto:', error);
      setErrorMessage('Er is een fout opgetreden bij het opslaan van de auto.');
      setIsLoading(false);
    }
  };
  
  const handleSaveChild = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const updatedHeenreisData = { ...heenreisData };
      
      if (!updatedHeenreisData.children) {
        updatedHeenreisData.children = [];
      }
      
      if (isEditing && editItem) {
        // Kind bijwerken in de wachtlijst
        const childIndex = updatedHeenreisData.children.findIndex(c => c.id === editItem.id);
        if (childIndex !== -1) {
          updatedHeenreisData.children[childIndex] = {
            ...updatedHeenreisData.children[childIndex],
            name: childForm.name
          };
        } else {
          // Kind bijwerken in een auto
          let foundAndUpdated = false;
          for (const car of updatedHeenreisData.cars || []) {
            const carChildIndex = car.assigned?.findIndex(c => c.id === editItem.id);
            if (carChildIndex !== -1) {
              car.assigned[carChildIndex] = {
                ...car.assigned[carChildIndex],
                name: childForm.name
              };
              foundAndUpdated = true;
              break;
            }
          }
          
          if (!foundAndUpdated) {
            throw new Error('Kind niet gevonden om bij te werken');
          }
        }
      } else {
        // Nieuw kind toevoegen
        const newChild = {
          id: Date.now().toString(),
          name: childForm.name
        };
        updatedHeenreisData.children.push(newChild);
      }
      
      await updateHeenreis(updatedHeenreisData);
      
      handleCloseDialog();
      setIsLoading(false);
    } catch (error) {
      console.error('Fout bij opslaan kind:', error);
      setErrorMessage('Er is een fout opgetreden bij het opslaan van het kind.');
      setIsLoading(false);
    }
  };
  
  // Auto en kind verwijderen
  const handleDeleteCar = async (carId) => {
    try {
      const updatedHeenreisData = { ...heenreisData };
      const carIndex = updatedHeenreisData.cars.findIndex(c => c.id === carId);
      
      if (carIndex !== -1) {
        // Als er kinderen in de auto zitten, verplaats ze naar de wachtlijst
        const car = updatedHeenreisData.cars[carIndex];
        if (car.assigned && car.assigned.length > 0) {
          if (!updatedHeenreisData.children) {
            updatedHeenreisData.children = [];
          }
          updatedHeenreisData.children = [
            ...updatedHeenreisData.children,
            ...car.assigned
          ];
        }
        
        // Verwijder de auto
        updatedHeenreisData.cars.splice(carIndex, 1);
        await updateHeenreis(updatedHeenreisData);
      }
    } catch (error) {
      console.error('Fout bij verwijderen auto:', error);
      setErrorMessage('Er is een fout opgetreden bij het verwijderen van de auto.');
    }
  };
  
  const handleDeleteChild = async (childId) => {
    try {
      const updatedHeenreisData = { ...heenreisData };
      
      // Zoek en verwijder het kind uit de wachtlijst
      const childIndex = updatedHeenreisData.children?.findIndex(c => c.id === childId);
      if (childIndex !== -1) {
        updatedHeenreisData.children.splice(childIndex, 1);
        await updateHeenreis(updatedHeenreisData);
        return;
      }
      
      // Zoek en verwijder het kind uit een auto
      for (const car of updatedHeenreisData.cars || []) {
        const carChildIndex = car.assigned?.findIndex(c => c.id === childId);
        if (carChildIndex !== -1) {
          car.assigned.splice(carChildIndex, 1);
          await updateHeenreis(updatedHeenreisData);
          return;
        }
      }
    } catch (error) {
      console.error('Fout bij verwijderen kind:', error);
      setErrorMessage('Er is een fout opgetreden bij het verwijderen van het kind.');
    }
  };
  
  // Drag & Drop handlers
  const handleDragStart = (event) => {
    const { active } = event;
    const childId = active.id;
    setActiveChildId(childId);
    
    // Zoek het kind voor de drag overlay
    let draggedChild = null;
    
    // Zoek in de wachtlijst
    if (heenreisData.children) {
      draggedChild = heenreisData.children.find(child => child.id === childId);
    }
    
    // Zoek in auto's
    if (!draggedChild && heenreisData.cars) {
      for (const car of heenreisData.cars) {
        if (car.assigned) {
          const childInCar = car.assigned.find(child => child.id === childId);
          if (childInCar) {
            draggedChild = childInCar;
            break;
          }
        }
      }
    }
    
    if (draggedChild) {
      setDragItem(draggedChild);
    }
  };
  
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    setActiveChildId(null);
    setDragItem(null);
    
    if (!over) return;
    
    const childId = active.id;
    const targetId = over.id;
    
    try {
      const updatedHeenreisData = { ...heenreisData };
      
      let childToMove = null;
      let sourceCarId = null;
      let isFromWaitingList = false;
      
      // Zoek het kind in de wachtlijst
      if (updatedHeenreisData.children) {
        const childIndex = updatedHeenreisData.children.findIndex(c => c.id === childId);
        if (childIndex !== -1) {
          childToMove = { ...updatedHeenreisData.children[childIndex] };
          updatedHeenreisData.children.splice(childIndex, 1);
          isFromWaitingList = true;
        }
      }
      
      // Als niet in wachtlijst, zoek in auto's
      if (!childToMove) {
        for (const car of updatedHeenreisData.cars || []) {
          if (car.assigned) {
            const childIndex = car.assigned.findIndex(c => c.id === childId);
            if (childIndex !== -1) {
              childToMove = { ...car.assigned[childIndex] };
              car.assigned.splice(childIndex, 1);
              sourceCarId = car.id;
              break;
            }
          }
        }
      }
      
      if (!childToMove) {
        console.error('Kind niet gevonden om te verplaatsen');
        return;
      }
      
      // Verwerk de drop target
      if (targetId === 'waitingList') {
        // Kind naar wachtlijst verplaatsen
        if (!updatedHeenreisData.children) {
          updatedHeenreisData.children = [];
        }
        updatedHeenreisData.children.push(childToMove);
      } else {
        // Kind naar auto verplaatsen
        const targetCarIndex = updatedHeenreisData.cars.findIndex(c => c.id === targetId);
        if (targetCarIndex !== -1) {
          const targetCar = updatedHeenreisData.cars[targetCarIndex];
          
          // Controleer of de auto vol is
          if (!targetCar.assigned) {
            targetCar.assigned = [];
          }
          
          if (targetCar.assigned.length >= targetCar.capacity) {
            if (sourceCarId === targetId) {
              // Als het kind al in deze auto zat, laat het terug gaan
              targetCar.assigned.push(childToMove);
            } else {
              // Anders gaat het terug naar de bron
              if (isFromWaitingList) {
                if (!updatedHeenreisData.children) {
                  updatedHeenreisData.children = [];
                }
                updatedHeenreisData.children.push(childToMove);
              } else if (sourceCarId) {
                const sourceCarIndex = updatedHeenreisData.cars.findIndex(c => c.id === sourceCarId);
                if (sourceCarIndex !== -1) {
                  if (!updatedHeenreisData.cars[sourceCarIndex].assigned) {
                    updatedHeenreisData.cars[sourceCarIndex].assigned = [];
                  }
                  updatedHeenreisData.cars[sourceCarIndex].assigned.push(childToMove);
                }
              }
              setErrorMessage('Deze auto is vol. Het kind kan niet worden toegevoegd.');
              return;
            }
          } else {
            // Auto is niet vol, voeg kind toe
            targetCar.assigned.push(childToMove);
          }
        }
      }
      
      await updateHeenreis(updatedHeenreisData);
    } catch (error) {
      console.error('Fout bij verplaatsen kind:', error);
      setErrorMessage('Er is een fout opgetreden bij het verplaatsen van het kind.');
    }
  };
  
  // Filter actieve gebruikers (alleen degenen die actief zijn op deze reis)
  const activeUsersOnThisTrip = activeUsers.filter(u => {
    return isUserActive(u.uid);
  });
  
  // Genereer kleuren voor elke gebruiker (voor avatars)
  const getUserColor = (userId) => {
    const colors = [
      '#FF5252', // rood
      '#FF9800', // oranje
      '#FFEB3B', // geel
      '#4CAF50', // groen
      '#2196F3', // blauw
      '#9C27B0', // paars
      '#795548', // bruin
      '#607D8B'  // grijs-blauw
    ];
    
    // Gebruik userId om een consistente kleur te krijgen
    const sum = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
  };
  
  // Genereer initialen voor gebruikers
  const getUserInitials = (user) => {
    if (user.displayName) {
      return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user.email ? user.email[0].toUpperCase() : '?';
  };
  
  if (!currentTrip || !heenreisData) {
    return <div className="p-4">Laden...</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Heenreis</h1>
        
        <div className="flex items-center">
          {/* Actieve gebruikers */}
          {activeUsersOnThisTrip.length > 0 && (
            <div className="mr-4 flex items-center">
              <Tooltip
                title={
                  <div className="p-1">
                    <p className="text-sm font-semibold mb-2">
                      {activeUsersOnThisTrip.length} actieve gebruiker(s)
                    </p>
                    <ul>
                      {activeUsersOnThisTrip.map(u => (
                        <li key={u.uid} className="mb-1 text-sm">
                          {u.displayName || u.email}
                          {u.uid === user?.uid && " (jij)"}
                        </li>
                      ))}
                    </ul>
                  </div>
                }
                arrow
              >
                <AvatarGroup max={4}>
                  {activeUsersOnThisTrip.map(u => (
                    <Avatar 
                      key={u.uid}
                      sx={{ 
                        bgcolor: getUserColor(u.uid),
                        width: 32, 
                        height: 32,
                        fontSize: '0.8rem',
                        border: u.uid === user?.uid ? '2px solid white' : 'none'
                      }}
                    >
                      {getUserInitials(u)}
                    </Avatar>
                  ))}
                </AvatarGroup>
              </Tooltip>
            </div>
          )}
          
          {/* Knoppen voor toevoegen van auto's en kinderen */}
          <div className="flex space-x-2">
            <Button
              variant="outlined"
              startIcon={<FaCarSide />}
              onClick={() => handleOpenCarDialog()}
            >
              Auto toevoegen
            </Button>
            <Button
              variant="outlined"
              startIcon={<FiUserPlus />}
              onClick={() => handleOpenChildDialog()}
            >
              Kind toevoegen
            </Button>
          </div>
        </div>
      </div>
      
      {errorMessage && (
        <Alert 
          severity="error" 
          className="mb-4"
          onClose={() => setErrorMessage(null)}
        >
          {errorMessage}
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Wachtlijst</h2>
              <Tooltip title="Kinderen die nog toegewezen moeten worden">
                <IconButton size="small">
                  <FiInfo />
                </IconButton>
              </Tooltip>
            </div>
            
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <ChildDropZone 
                id="waitingList"
                className="min-h-[100px] bg-white p-3 rounded border border-dashed border-gray-300"
              >
                {heenreisData.children && heenreisData.children.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {heenreisData.children.map(child => (
                      <DraggableChild 
                        key={child.id} 
                        child={child}
                        isActive={activeChildId === child.id}
                        onEdit={() => handleOpenChildDialog(child)}
                        onDelete={() => handleDeleteChild(child.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Geen kinderen in de wachtlijst
                  </p>
                )}
              </ChildDropZone>
              
              <DragOverlay>
                {dragItem ? (
                  <div className="bg-white p-2 rounded shadow-lg border border-blue-500">
                    {dragItem.name}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Auto's</h2>
              <Tooltip title="Sleep kinderen naar auto's om ze toe te wijzen">
                <IconButton size="small">
                  <FiInfo />
                </IconButton>
              </Tooltip>
            </div>
            
            {heenreisData.cars && heenreisData.cars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {heenreisData.cars.map(car => (
                  <Car 
                    key={car.id}
                    car={car}
                    activeChildId={activeChildId}
                    onEdit={() => handleOpenCarDialog(car)}
                    onDelete={() => handleDeleteCar(car.id)}
                    onEditChild={handleOpenChildDialog}
                    onDeleteChild={handleDeleteChild}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8 bg-white rounded">
                Geen auto's toegevoegd. Voeg een auto toe om kinderen toe te wijzen.
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Auto dialog */}
      <Dialog open={showCarDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Auto bewerken' : 'Auto toevoegen'}</DialogTitle>
        <DialogContent>
          <div className="pt-2 space-y-4">
            <TextField
              label="Chauffeur"
              fullWidth
              value={carForm.driver}
              onChange={e => setCarForm({...carForm, driver: e.target.value})}
              required
            />
            <TextField
              label="Capaciteit (aantal kinderen)"
              type="number"
              fullWidth
              value={carForm.capacity}
              onChange={e => setCarForm({...carForm, capacity: e.target.value})}
              required
              inputProps={{ min: 1, max: 10 }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isLoading}>
            Annuleren
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveCar}
            disabled={isLoading || !carForm.driver || !carForm.capacity}
          >
            {isLoading ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Kind dialog */}
      <Dialog open={showChildDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Kind bewerken' : 'Kind toevoegen'}</DialogTitle>
        <DialogContent>
          <div className="pt-2">
            <TextField
              label="Naam"
              fullWidth
              value={childForm.name}
              onChange={e => setChildForm({...childForm, name: e.target.value})}
              required
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isLoading}>
            Annuleren
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveChild}
            disabled={isLoading || !childForm.name}
          >
            {isLoading ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default HeenreisPage; 