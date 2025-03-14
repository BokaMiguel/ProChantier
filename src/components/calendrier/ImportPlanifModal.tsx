import React, { useState, useEffect, useMemo, FC } from "react";
import { 
  FaSearch, FaCalendarAlt, 
  FaCheck, FaTimes, FaFileImport,
  FaCheckSquare, FaTimesCircle, FaChevronDown, FaChevronUp
} from "react-icons/fa";
import { Sun, Moon, AlertTriangle, Beaker } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, IconButton, Typography, Box, Grid, TextField, 
  FormControl, InputLabel, Select, MenuItem, InputAdornment,
  Divider, Paper, Chip,
  Checkbox, Tooltip, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Planif } from "../../models/JournalFormModel";
import { useAuth } from "../../context/AuthContext";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import frLocale from "date-fns/locale/fr";

interface ImportPlanifModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (selectedPlanifications: Planif[]) => void;
  planifications: Planif[];
  preselectedDate?: Date | null;
}

const ImportPlanifModal: FC<ImportPlanifModalProps> = ({
  isOpen,
  onClose,
  onImport,
  planifications,
  preselectedDate,
}) => {
  const { activites, lieux, sousTraitants, signalisations } = useAuth();
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [lieuFilter, setLieuFilter] = useState<number | null>(null);
  const [entrepriseFilter, setEntrepriseFilter] = useState<number | null>(null);
  
  // États pour la sélection et l'affichage
  const [selectedPlanifications, setSelectedPlanifications] = useState<Planif[]>([]);
  const [expandedPlanifs, setExpandedPlanifs] = useState<number[]>([]);
  const [importDate, setImportDate] = useState<Date | null>(preselectedDate || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Réinitialiser les sélections à chaque ouverture du modal
  useEffect(() => {
    if (isOpen) {
      setSelectedPlanifications([]);
      setSearchTerm("");
      setLieuFilter(null);
      setEntrepriseFilter(null);
      setExpandedPlanifs([]);
      setImportDate(preselectedDate || new Date());
      setShowDatePicker(false);
    }
  }, [isOpen, preselectedDate]);
  
  // Lieux uniques pour le filtre
  const uniqueLieux = useMemo(() => {
    const lieuxSet = new Set<number>();
    planifications.forEach(planif => {
      planif.PlanifActivites?.forEach(act => {
        if (act.lieuId) lieuxSet.add(act.lieuId);
      });
    });
    return Array.from(lieuxSet);
  }, [planifications]);
  
  // Entreprises uniques pour le filtre
  const uniqueEntreprises = useMemo(() => {
    const entreprisesSet = new Set<number>();
    planifications.forEach(planif => {
      if (planif.defaultEntreprise) entreprisesSet.add(planif.defaultEntreprise);
    });
    return Array.from(entreprisesSet);
  }, [planifications]);
  
  // Filtrer les planifications en fonction des critères de recherche
  const filteredPlanifications = useMemo(() => {
    return planifications.filter(planif => {
      // Filtre par recherche (nom d'activité)
      const activiteMatch = !searchTerm || 
        (planif.PlanifActivites && planif.PlanifActivites.some(pa => {
          const activite = activites?.find(a => a.id === pa.activiteId);
          return activite && activite.nom.toLowerCase().includes(searchTerm.toLowerCase());
        }));
      
      // Filtre par lieu
      const lieuMatch = !lieuFilter || 
        (planif.PlanifActivites && planif.PlanifActivites.some(pa => pa.lieuId === lieuFilter));
      
      // Filtre par entreprise
      const entrepriseMatch = !entrepriseFilter || planif.defaultEntreprise === entrepriseFilter;
      
      return activiteMatch && lieuMatch && entrepriseMatch;
    });
  }, [planifications, searchTerm, lieuFilter, entrepriseFilter, activites]);
  
  // Gérer la sélection d'une planification
  const handleSelectPlanification = (planif: Planif) => {
    setSelectedPlanifications(prev => {
      const isSelected = prev.some(p => p.ID === planif.ID);
      if (isSelected) {
        return prev.filter(p => p.ID !== planif.ID);
      } else {
        return [...prev, planif];
      }
    });
  };
  
  // Sélectionner ou désélectionner toutes les planifications
  const handleSelectAll = () => {
    if (selectedPlanifications.length === filteredPlanifications.length) {
      setSelectedPlanifications([]);
    } else {
      setSelectedPlanifications([...filteredPlanifications]);
    }
  };
  
  // Désélectionner toutes les planifications
  const handleDeselectAll = () => {
    setSelectedPlanifications([]);
  };
  
  // Importer les planifications sélectionnées
  const handleImport = () => {
    if (selectedPlanifications.length === 0) {
      return;
    }
    
    // Si une date est déjà présélectionnée, confirmer directement l'importation
    if (preselectedDate) {
      handleConfirmImport();
    } else {
      // Sinon, afficher le dialogue de sélection de date
      setShowDatePicker(true);
    }
  };
  
  // Confirmer l'importation avec la date sélectionnée
  const handleConfirmImport = () => {
    if (!importDate) {
      // Afficher un message d'erreur si aucune date n'est sélectionnée
      alert("Veuillez sélectionner une date d'importation");
      return;
    }
    
    // Formater la date au format YYYY-MM-DD pour l'API
    const formattedDate = format(importDate, "yyyy-MM-dd");
    
    // Créer des copies des planifications avec ID à 0 et la nouvelle date
    const planificationsToImport = selectedPlanifications.map(planif => {
      // Créer une copie profonde de la planification
      const newPlanif = {
        ...planif,
        ID: 0, // Remettre l'ID à 0 pour indiquer une nouvelle planification
        Date: formattedDate, // Utiliser la date d'importation sélectionnée
        PlanifActivites: planif.PlanifActivites ? planif.PlanifActivites.map(act => ({
          ...act,
          ID: 0, // Remettre l'ID de l'activité à 0
          PlanifID: 0, // Référence à la nouvelle planification
          isComplete: false // Réinitialiser le statut de complétion
        })) : []
      };
      
      return newPlanif;
    });
    
    console.log("Planifications à importer avec la date", formattedDate, ":", planificationsToImport);
    
    // Appeler la fonction onImport avec les planifications modifiées
    onImport(planificationsToImport);
    
    // Fermer le dialogue de sélection de date et le modal principal
    setShowDatePicker(false);
    onClose();
  };
  
  // Obtenir le nom d'une activité
  const getActivityName = (id: number) => {
    const activity = activites?.find(a => a.id === id);
    return activity ? activity.nom : "Activité inconnue";
  };
  
  // Obtenir le nom d'un lieu
  const getLieuName = (id: number | null) => {
    if (!id) return "Non spécifié";
    const lieu = lieux?.find(l => l.id === id);
    return lieu ? lieu.nom : "Lieu inconnu";
  };
  
  // Obtenir le nom d'une entreprise
  const getEntrepriseName = (id: number | null) => {
    if (!id) return "Non spécifié";
    const entreprise = sousTraitants?.find(e => e.id === id);
    return entreprise ? entreprise.nom : "Entreprise inconnue";
  };
  
  // Obtenir le nom d'une signalisation
  const getSignalisationName = (signalisationId: number) => {

    const signalisation = signalisations?.find(s => s.id === signalisationId);
    return signalisation ? signalisation.nom : "Signalisation inconnue";
  };
  
  // Formater la date
  const formatDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (!isValid(date)) return "Date invalide";
      return format(date, "dd/MM/yyyy", { locale: fr });
    } catch (error) {
      return "Date invalide";
    }
  };
  
  // Vérifier si une planification est sélectionnée
  const isPlanificationSelected = (id: number) => {
    return selectedPlanifications.some(p => p.ID === id);
  };
  
  // Vérifier si l'heure est de nuit (après 17h)
  const isNightActivity = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    return hour >= 17 || hour < 7;
  };
  
  // Afficher l'horaire d'une activité avec une indication claire jour/nuit
  const renderActivityTime = (debut: string, fin: string) => {
    const isNight = isNightActivity(debut);
    const TimeIcon = isNight ? Moon : Sun;
    const timeIconColor = isNight ? "#9c27b0" : "#f59e0b"; // indigo-500 ou amber-500
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TimeIcon size={14} color={timeIconColor} style={{ marginRight: 8 }} />
        <Typography variant="body2" color="text.secondary">
          {debut} - {fin}
        </Typography>
      </Box>
    );
  };
  
  // Gérer l'expansion des détails d'une planification
  const handleExpandPlanif = (planifId: number) => {
    setExpandedPlanifs(prev => {
      const isExpanded = prev.includes(planifId);
      if (isExpanded) {
        return prev.filter(id => id !== planifId);
      } else {
        return [...prev, planifId];
      }
    });
  };
  
  // Si le modal n'est pas ouvert, ne rien afficher
  if (!isOpen) return null;
  
  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          Importer des planifications
        </Typography>
        <IconButton onClick={onClose} size="small">
          <FaTimes />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pb: 1 }}>
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaSearch size={16} />
                    </InputAdornment>
                  ),
                }}
                size="small"
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl size="small" fullWidth>
                <InputLabel id="lieu-filter-label">Lieu</InputLabel>
                <Select
                  labelId="lieu-filter-label"
                  value={lieuFilter || ""}
                  onChange={(e) => setLieuFilter(e.target.value === "" ? null : Number(e.target.value))}
                  label="Lieu"
                >
                  <MenuItem value="">Tous les lieux</MenuItem>
                  {uniqueLieux.map((lieuId) => {
                    const lieu = lieux?.find(l => l.id === lieuId);
                    return (
                      <MenuItem key={lieuId} value={lieuId}>
                        {lieu ? lieu.nom : `Lieu #${lieuId}`}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="entreprise-filter-label">Entreprise</InputLabel>
                <Select
                  labelId="entreprise-filter-label"
                  value={entrepriseFilter || ""}
                  onChange={(e) => setEntrepriseFilter(e.target.value === "" ? null : Number(e.target.value))}
                  label="Entreprise"
                >
                  <MenuItem value="">Toutes les entreprises</MenuItem>
                  {uniqueEntreprises.map((entrepriseId) => {
                    const entreprise = sousTraitants?.find(st => st.id === entrepriseId);
                    return (
                      <MenuItem key={entrepriseId} value={entrepriseId}>
                        {entreprise ? entreprise.nom : `Entreprise #${entrepriseId}`}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ mb: 1.5 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="subtitle2">
            {filteredPlanifications.length} planification(s) trouvée(s)
          </Typography>
          <Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FaCheckSquare size={14} />}
              onClick={handleSelectAll}
              sx={{ mr: 1, py: 0.5 }}
            >
              Tout sélectionner
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<FaTimesCircle size={14} />}
              onClick={handleDeselectAll}
              sx={{ py: 0.5 }}
            >
              Tout désélectionner
            </Button>
          </Box>
        </Box>
        
        {filteredPlanifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Aucune planification trouvée avec les critères de recherche actuels.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedPlanifications.length > 0 && selectedPlanifications.length < filteredPlanifications.length}
                      checked={selectedPlanifications.length > 0 && selectedPlanifications.length === filteredPlanifications.length}
                      onChange={handleSelectAll}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Planification</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Horaire</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Entreprise</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Activités</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Note</TableCell>
                  <TableCell sx={{ width: 50 }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPlanifications.map((planif) => (
                  <React.Fragment key={planif.ID}>
                    <TableRow 
                      hover
                      selected={isPlanificationSelected(planif.ID)}
                      onClick={() => handleSelectPlanification(planif)}
                      sx={{ 
                        '&.Mui-selected': { 
                          backgroundColor: 'rgba(25, 118, 210, 0.08)' 
                        },
                        cursor: 'pointer'
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isPlanificationSelected(planif.ID)}
                          onChange={() => handleSelectPlanification(planif)}
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>#{planif.ID}</TableCell>
                      <TableCell>{formatDate(planif.Date)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {isNightActivity(planif.HrsDebut) ? 
                            <Moon size={14} style={{ marginRight: 6, color: '#9c27b0' }} /> : 
                            <Sun size={14} style={{ marginRight: 6, color: '#f59e0b' }} />
                          }
                          {planif.HrsDebut} - {planif.HrsFin}
                        </Box>
                      </TableCell>
                      <TableCell>{getEntrepriseName(planif.defaultEntreprise)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" noWrap sx={{ maxWidth: '150px' }}>
                            {planif.PlanifActivites && planif.PlanifActivites.length > 0
                              ? getActivityName(planif.PlanifActivites[0].activiteId)
                              : "Aucune activité"}
                          </Typography>
                          {planif.PlanifActivites && planif.PlanifActivites.length > 1 && (
                            <Tooltip title={
                              <React.Fragment>
                                {planif.PlanifActivites.slice(1).map((act, index) => (
                                  <Typography key={act.ID} variant="caption" component="div">
                                    ACT {index + 2}: {getActivityName(act.activiteId)}
                                  </Typography>
                                ))}
                              </React.Fragment>
                            }>
                              <Chip 
                                size="small" 
                                label={`+${planif.PlanifActivites.length - 1}`} 
                                color="primary" 
                                sx={{ ml: 0.5, height: 20, '& .MuiChip-label': { px: 0.5, py: 0 } }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {planif.note && (
                          <Tooltip title={planif.note}>
                            <Typography variant="body2" noWrap sx={{ maxWidth: '150px' }}>
                              {planif.note}
                            </Typography>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Voir les détails des activités">
                          <IconButton 
                            size="small" 
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              handleExpandPlanif(planif.ID);
                            }}
                          >
                            {expandedPlanifs.includes(planif.ID) ? 
                              <FaChevronUp size={12} /> : 
                              <FaChevronDown size={12} />
                            }
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    
                    {expandedPlanifs.includes(planif.ID) && (
                      <TableRow>
                        <TableCell colSpan={8} sx={{ p: 0, borderBottom: 0 }}>
                          <Box sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.01)' }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                              Détails des activités
                            </Typography>
                            
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow sx={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                                    <TableCell sx={{ fontWeight: 'bold', width: 60 }}>Ordre</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Activité</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Horaire</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Lieu</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Entreprise</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Signalisation</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Lab</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {planif.PlanifActivites.map((activity, index) => (
                                    <TableRow key={activity.ID}>
                                      <TableCell>
                                        <Chip 
                                          size="small" 
                                          label={`ACT ${index + 1}`} 
                                          color="primary" 
                                          variant="outlined"
                                          sx={{ height: 20, '& .MuiChip-label': { px: 0.5, py: 0 } }}
                                        />
                                      </TableCell>
                                      <TableCell sx={{ color: 'primary.main', fontWeight: 500 }}>
                                        {getActivityName(activity.activiteId)}
                                      </TableCell>
                                      <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          {isNightActivity(activity.debut || planif.HrsDebut) ? 
                                            <Moon size={14} style={{ marginRight: 6, color: '#9c27b0' }} /> : 
                                            <Sun size={14} style={{ marginRight: 6, color: '#f59e0b' }} />
                                          }
                                          {activity.debut || planif.HrsDebut} - {activity.fin || planif.HrsFin}
                                        </Box>
                                      </TableCell>
                                      <TableCell>{getLieuName(activity.lieuId)}</TableCell>
                                      <TableCell>{getEntrepriseName(activity.sousTraitantId || planif.defaultEntreprise)}</TableCell>
                                      <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <AlertTriangle size={14} style={{ marginRight: 6, color: '#666' }} />
                                          {getSignalisationName(activity.signalisation)}
                                        </Box>
                                      </TableCell>
                                      <TableCell>
                                        {activity.qteLab !== null && activity.qteLab !== undefined && (
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Beaker size={14} style={{ marginRight: 6, color: '#666' }} />
                                            {activity.qteLab}
                                          </Box>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 2, py: 1.5, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            {selectedPlanifications.length} planification(s) sélectionnée(s)
          </Typography>
        </Box>
        <Button onClick={onClose} size="small" sx={{ mr: 1 }}>
          Annuler
        </Button>
        <Button 
          onClick={handleImport} 
          variant="contained" 
          color="primary" 
          disabled={selectedPlanifications.length === 0}
          size="small"
          startIcon={<FaFileImport size={14} />}
        >
          Importer
        </Button>
        
        {showDatePicker && (
          <Dialog
            open={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
              }
            }}
          >
            <DialogTitle 
              sx={{ 
                pb: 1, 
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FaCalendarAlt size={18} style={{ marginRight: 10, color: '#1976d2' }} />
                <Typography variant="h6">Sélectionner la date d'importation</Typography>
              </Box>
              <IconButton 
                size="small" 
                onClick={() => setShowDatePicker(false)}
                sx={{ ml: 1 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ py: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Veuillez sélectionner la date à laquelle vous souhaitez importer les {selectedPlanifications.length} planification(s) sélectionnée(s).
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
                  <DatePicker
                    value={importDate}
                    onChange={(newValue) => {
                      setImportDate(newValue);
                    }}
                    slotProps={{ 
                      textField: { 
                        size: "medium", 
                        fullWidth: true,
                        sx: { maxWidth: 300 }
                      } 
                    }}
                  />
                </LocalizationProvider>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0,0,0,0.08)', justifyContent: 'space-between' }}>
              <Button 
                onClick={() => setShowDatePicker(false)} 
                size="medium" 
                variant="outlined"
                startIcon={<FaTimes size={14} />}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleConfirmImport} 
                variant="contained" 
                color="primary" 
                size="medium"
                startIcon={<FaCheck size={14} />}
                disabled={!importDate}
              >
                Confirmer l'importation
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImportPlanifModal;
