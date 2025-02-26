import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Collapse,
  Checkbox,
  Box,
  Typography,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { Employe, TabEquipeChantier } from '../../../models/JournalFormModel';

interface EditDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (nom: string) => void;
  initialValue?: string;
}

const EditDialog: React.FC<EditDialogProps> = ({ open, onClose, onSubmit, initialValue = '' }) => {
  const [nom, setNom] = useState(initialValue);

  const handleSubmit = () => {
    onSubmit(nom);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{initialValue ? 'Modifier l\'équipe' : 'Nouvelle équipe'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Nom de l'équipe"
          fullWidth
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {initialValue ? 'Modifier' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface AddEmployesDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (selectedEmployes: number[]) => void;
  equipe: TabEquipeChantier;
  availableEmployes: Employe[];
}

const AddEmployesDialog: React.FC<AddEmployesDialogProps> = ({ open, onClose, onSubmit, equipe, availableEmployes }) => {
  const [selectedEmployes, setSelectedEmployes] = useState<number[]>([]);

  const handleSubmit = () => {
    onSubmit(selectedEmployes);
    setSelectedEmployes([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Ajouter des employés à l'équipe: {equipe.nom}
      </DialogTitle>
      <DialogContent>
        <List>
          {availableEmployes.map((employe) => (
            <ListItem
              key={employe.id}
              secondaryAction={
                <Checkbox
                  edge="end"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedEmployes([...selectedEmployes, employe.id]);
                    } else {
                      setSelectedEmployes(selectedEmployes.filter(id => id !== employe.id));
                    }
                  }}
                  checked={selectedEmployes.includes(employe.id)}
                />
              }
            >
              <ListItemText
                primary={`${employe.prenom} ${employe.nom}`}
                secondary={
                  employe.fonction && employe.equipement 
                    ? `${employe.fonction.nom} - ${employe.equipement.nom}` 
                    : employe.fonction 
                      ? employe.fonction.nom 
                      : employe.equipement 
                        ? employe.equipement.nom 
                        : 'Sans fonction et équipement'
                }
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Ajouter
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EquipeManagement: React.FC = () => {
  const { selectedProject, equipes, employees, fetchEquipes, createOrUpdateEquipeChantier, deleteEquipeChantier, addEmployeToEquipe, removeEmployeFromEquipe } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addEmployesDialogOpen, setAddEmployesDialogOpen] = useState(false);
  const [selectedEquipe, setSelectedEquipe] = useState<TabEquipeChantier | null>(null);
  const [expandedEquipe, setExpandedEquipe] = useState<number | null>(null);

  const handleAddEquipe = async (nom: string) => {
    if (!selectedProject) return;
    try {
      await createOrUpdateEquipeChantier({
        id: 0,
        nom: nom,
        projetId: selectedProject.ID,
        employes: []
      });
      if (selectedProject.ID) {
        await fetchEquipes(selectedProject.ID);
      }
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleEditEquipe = async (nom: string) => {
    if (!selectedProject || !selectedEquipe) return;
    try {
      await createOrUpdateEquipeChantier({
        ...selectedEquipe,
        nom: nom,
        projetId: selectedProject.ID
      });
      if (selectedProject.ID) {
        await fetchEquipes(selectedProject.ID);
      }
      setEditDialogOpen(false);
      setSelectedEquipe(null);
    } catch (error) {
      console.error('Error updating team:', error);
    }
  };

  const handleDeleteEquipe = async (equipe: TabEquipeChantier) => {
    try {
      await deleteEquipeChantier(equipe.id);
      if (selectedProject?.ID) {
        await fetchEquipes(selectedProject.ID);
      }
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const handleAddEmployes = async (selectedEmployes: number[]) => {
    if (!selectedEquipe) return;
    
    try {
      for (const employeId of selectedEmployes) {
        await addEmployeToEquipe(selectedEquipe.id, employeId);
      }
      
      if (selectedProject?.ID) {
        await fetchEquipes(selectedProject.ID);
      }
    } catch (error) {
      console.error('Error adding employees to team:', error);
    }
  };

  const handleRemoveEmploye = async (equipe: TabEquipeChantier, employeId: number) => {
    try {
      await removeEmployeFromEquipe(equipe.id, employeId);
      if (selectedProject?.ID) {
        await fetchEquipes(selectedProject.ID);
      }
    } catch (error) {
      console.error('Error removing employee from team:', error);
    }
  };

  const getAvailableEmployes = (equipe: TabEquipeChantier): Employe[] => {
    if (!employees) return [];
    return employees.filter(
      (employe) => !equipe.employes?.some((e) => e.bottinID === employe.id)
    );
  };

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Équipes</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedEquipe(null);
            setEditDialogOpen(true);
          }}
        >
          Nouvelle équipe
        </Button>
      </Box>

      <List>
        {equipes?.map((equipe) => (
          <React.Fragment key={equipe.id}>
            <ListItem
              disablePadding
              secondaryAction={
                <>
                  <IconButton onClick={() => {
                    setSelectedEquipe(equipe);
                    setEditDialogOpen(true);
                  }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteEquipe(equipe)}>
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <ListItemButton onClick={() => setExpandedEquipe(expandedEquipe === equipe.id ? null : equipe.id)}>
                <ListItemText 
                  primary={
                    <Box display="flex" alignItems="center">
                      <Typography>{equipe.nom}</Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                        ({equipe.employes?.length || 0} employés)
                      </Typography>
                    </Box>
                  }
                />
                {expandedEquipe === equipe.id ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={expandedEquipe === equipe.id} timeout="auto" unmountOnExit>
              <Box display="flex" justifyContent="flex-end" p={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setSelectedEquipe(equipe);
                    setAddEmployesDialogOpen(true);
                  }}
                >
                  Ajouter des employés
                </Button>
              </Box>
              <List component="div" disablePadding>
                {equipe.employes?.map((employe) => (
                  <ListItem
                    key={employe.bottinID}
                    sx={{ pl: 4 }}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveEmploye(equipe, employe.bottinID)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={`${employe.prenom} ${employe.nom}`}
                      secondary={
                        employe.fonction && employe.equipement 
                          ? `${employe.fonction.nom} - ${employe.equipement.nom}` 
                          : employe.fonction 
                            ? employe.fonction.nom 
                            : employe.equipement 
                              ? employe.equipement.nom 
                              : 'Sans fonction et équipement'
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>

      <EditDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedEquipe(null);
        }}
        onSubmit={selectedEquipe ? handleEditEquipe : handleAddEquipe}
        initialValue={selectedEquipe?.nom}
      />

      {selectedEquipe && (
        <AddEmployesDialog
          open={addEmployesDialogOpen}
          onClose={() => {
            setAddEmployesDialogOpen(false);
            setSelectedEquipe(null);
          }}
          onSubmit={handleAddEmployes}
          equipe={selectedEquipe}
          availableEmployes={getAvailableEmployes(selectedEquipe)}
        />
      )}
    </div>
  );
};

export default EquipeManagement;
