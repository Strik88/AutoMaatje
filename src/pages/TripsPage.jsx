import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRideContext } from '../context/RideContext';
import { useAuthContext } from '../context/AuthContext';
import { 
  Button, 
  Card, 
  CardContent, 
  CardActions, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Typography,
  Tooltip,
  IconButton,
  Badge,
  CircularProgress,
  Box,
  Stack,
  Container,
  Paper,
  Grid
} from '@mui/material';
import { 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiArrowRight,
  FiUsers,
  FiCalendar,
  FiMapPin
} from 'react-icons/fi';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

function TripsPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { 
    trips, 
    currentTrip, 
    loadTrip, 
    loading, 
    error, 
    setupInitialData,
    updateTripInfo,
    removeTrip,
    loadTrips,
    createTrip,
    deleteTrip
  } = useRideContext();
  
  const [newTripTitle, setNewTripTitle] = useState('');
  const [newTripDestination, setNewTripDestination] = useState('');
  const [newTripDate, setNewTripDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTripId, setEditTripId] = useState(null);
  const [editTripTitle, setEditTripTitle] = useState('');
  const [editTripDestination, setEditTripDestination] = useState('');
  const [editTripDate, setEditTripDate] = useState('');
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingTripId, setDeletingTripId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  
  // Functie om een nieuwe trip aan te maken
  const handleCreateTrip = async (e) => {
    e.preventDefault();
    
    if (!newTripTitle || !newTripDestination || !newTripDate) {
      alert('Vul alle velden in');
      return;
    }
    
    try {
      // De ingevoerde gegevens doorgeven aan setupInitialData
      await setupInitialData({
        title: newTripTitle,
        destination: newTripDestination,
        date: new Date(newTripDate).toISOString()
      });
      
      // Reset form
      setNewTripTitle('');
      setNewTripDestination('');
      setNewTripDate(new Date().toISOString().split('T')[0]);
      setIsCreating(false);
    } catch (error) {
      console.error('Fout bij aanmaken trip:', error);
    }
  };

  // Functie om te beginnen met bewerken van een trip
  const handleStartEdit = (trip) => {
    setEditTripId(trip.id);
    setEditTripTitle(trip.title);
    setEditTripDestination(trip.destination);
    setEditTripDate(new Date(trip.date).toISOString().split('T')[0]);
    setIsEditing(true);
    setIsCreating(false);
  };

  // Functie om een trip bij te werken
  const handleUpdateTrip = async (e) => {
    e.preventDefault();
    
    if (!editTripTitle || !editTripDestination || !editTripDate) {
      alert('Vul alle velden in');
      return;
    }
    
    try {
      await updateTripInfo(editTripId, {
        title: editTripTitle,
        destination: editTripDestination,
        date: new Date(editTripDate).toISOString()
      });
      
      // Reset edit form
      setEditTripId(null);
      setEditTripTitle('');
      setEditTripDestination('');
      setEditTripDate('');
      setIsEditing(false);
    } catch (error) {
      console.error('Fout bij bijwerken trip:', error);
    }
  };

  // Functie om het bewerken te annuleren
  const handleCancelEdit = () => {
    setEditTripId(null);
    setEditTripTitle('');
    setEditTripDestination('');
    setEditTripDate('');
    setIsEditing(false);
  };

  // Functie om te beginnen met verwijderen van een trip
  const handleStartDelete = (tripId) => {
    setDeleteConfirmationId(tripId);
  };

  // Functie om verwijderen te bevestigen
  const handleConfirmDelete = async (tripId) => {
    try {
      await removeTrip(tripId);
      setDeleteConfirmationId(null);
    } catch (error) {
      console.error('Fout bij verwijderen trip:', error);
    }
  };

  // Functie om verwijderen te annuleren
  const handleCancelDelete = () => {
    setDeleteConfirmationId(null);
  };
  
  // Functie om een trip te selecteren
  const handleSelectTrip = (tripId) => {
    // Alleen selecteren als we niet bezig zijn met bewerken/verwijderen
    if (!isEditing && deleteConfirmationId === null) {
      loadTrip(tripId);
    }
  };
  
  // Formateer datum voor weergave
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('nl-NL', options);
  };
  
  // Functie om te controleren of een gebruiker actief is op een trip
  const getActiveUsers = (trip) => {
    if (!trip.activeUsers || trip.activeUsers.length === 0) return [];
    
    return trip.activeUsers.filter(u => {
      if (!u.lastActive) return false;
      
      const lastActiveTime = new Date(u.lastActive).getTime();
      const currentTime = new Date().getTime();
      const fiveMinutesInMs = 5 * 60 * 1000;
      
      return (currentTime - lastActiveTime) < fiveMinutesInMs;
    });
  };
  
  const handleOpenDialog = (trip = null) => {
    if (trip) {
      // Edit mode
      setIsEditing(true);
      setEditingTripId(trip.id);
      setFormData({
        name: trip.title || '',
        destination: trip.destination || '',
        date: trip.date ? new Date(trip.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else {
      // Create mode
      setIsEditing(false);
      setEditingTripId(null);
      setFormData({
        name: '',
        destination: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setShowDialog(true);
    setFormError(null);
  };
  
  const handleCloseDialog = () => {
    setShowDialog(false);
    setIsEditing(false);
    setEditingTripId(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    
    try {
      if (!formData.name.trim()) {
        throw new Error('Een naam voor de trip is verplicht');
      }
      
      if (isEditing && editingTripId) {
        // Update existing trip
        await updateTripInfo(editingTripId, formData);
        await loadTrips(); // Refresh trip list
      } else {
        // Create new trip
        const newTripData = {
          ...formData,
          heenreis: {
            cars: [],
            children: []
          },
          terugreis: {
            cars: [],
            children: []
          }
        };
        
        try {
          // Probeer een nieuwe trip aan te maken
          const tripId = await createTrip(newTripData);
          
          // Laad de nieuw aangemaakte trip en navigeer naar Heenreis pagina
          await loadTrip(tripId);
          navigate('/heenreis');
        } catch (error) {
          console.error("Fout bij aanmaken trip:", error);
          
          // Toon foutmelding aan gebruiker
          setFormError("Er is een probleem opgetreden bij het aanmaken van de trip. Probeer het later opnieuw.");
          setIsSubmitting(false);
          return;
        }
      }
      
      // Sluit dialoog na succesvol opslaan
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving trip:', error);
      setFormError(error.message || 'Er is een fout opgetreden bij het opslaan van de trip');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleOpenDeleteDialog = (tripId) => {
    setDeletingTripId(tripId);
    setShowDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeletingTripId(null);
  };
  
  const handleDeleteTrip = async () => {
    try {
      setIsSubmitting(true);
      await deleteTrip(deletingTripId);
      await loadTrips(); // Refresh trip list
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deleting trip:', error);
      setFormError('Er is een fout opgetreden bij het verwijderen van de trip');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box my={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
            Ritten
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Nieuwe Rit
          </Button>
        </Box>

        {error && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        {trips.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              Geen ritten gevonden. Maak een nieuwe rit aan om te beginnen.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {trips.map((trip) => {
              const activeUsers = getActiveUsers(trip);
              const isCurrentUserActive = user && activeUsers.some(u => u.uid === user.uid);
              
              return (
                <Grid item xs={12} sm={6} md={4} key={trip.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="h6" component="h2">
                          {trip.title}
                        </Typography>
                        <Box>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenDialog(trip)}
                          >
                            <FiEdit2 />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleOpenDeleteDialog(trip.id)}
                          >
                            <FiTrash2 />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography color="textSecondary" gutterBottom>
                        {formatDate(trip.date)}
                      </Typography>
                      <Typography variant="body2">
                        Bestemming: {trip.destination}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        fullWidth
                        onClick={() => handleSelectTrip(trip.id)}
                      >
                        Selecteer
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Dialoog voor het aanmaken/bewerken van een trip */}
      <Dialog open={showDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {isEditing ? 'Rit wijzigen' : 'Nieuwe rit maken'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {formError && (
              <Box mb={2} p={1} bgcolor="error.light">
                <Typography color="error">{formError}</Typography>
              </Box>
            )}
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Naam van de rit"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="dense"
              name="destination"
              label="Bestemming"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.destination}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="dense"
              name="date"
              label="Datum"
              type="date"
              fullWidth
              variant="outlined"
              value={formData.date}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Annuleren
            </Button>
            <Button 
              type="submit" 
              color="primary" 
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Opslaan'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Bevestigingsdialoog voor verwijderen */}
      <Dialog
        open={showDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>
          Rit verwijderen
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Weet je zeker dat je deze rit wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Annuleren
          </Button>
          <Button 
            onClick={handleDeleteTrip} 
            color="error" 
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Verwijderen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TripsPage; 