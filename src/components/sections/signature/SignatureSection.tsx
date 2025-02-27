import React, { useRef, useState } from 'react';
import SignaturePad from 'react-signature-canvas';
import { FaUndo, FaSave, FaTimes } from 'react-icons/fa';

interface SignatureSectionProps {
  onSignatureComplete: (signatureData: {
    signature: string;
    signataire: string;
    date: Date;
  }) => void;
}

const SignatureSection: React.FC<SignatureSectionProps> = ({ onSignatureComplete }) => {
  const signaturePadRef = useRef<SignaturePad>(null);
  const [signataire, setSignataire] = useState('');
  const [error, setError] = useState('');

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
    setError('');
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      setError('Veuillez signer avant de continuer');
      return;
    }

    if (!signataire.trim()) {
      setError('Veuillez entrer le nom du signataire');
      return;
    }

    const signatureData = {
      signature: signaturePadRef.current.toDataURL('image/png', 1.0),
      signataire: signataire,
      date: new Date(),
    };

    // Appeler la fonction de callback avec les données de signature
    onSignatureComplete(signatureData);
    
    // Afficher un message de confirmation
    console.log("Signature validée avec succès");
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="space-y-6">
        {/* Champ du nom du signataire */}
        <div>
          <label htmlFor="signataire" className="block text-sm font-medium text-gray-700 mb-2">
            Nom du signataire
          </label>
          <input
            type="text"
            id="signataire"
            value={signataire}
            onChange={(e) => {
              setSignataire(e.target.value);
              setError('');
            }}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Entrez votre nom complet"
          />
        </div>

        {/* Pad de signature */}
        <div className="border rounded-lg overflow-hidden">
          <SignaturePad
            ref={signaturePadRef}
            canvasProps={{
              className: 'w-full touch-none',
              style: {
                minHeight: '200px',
                maxWidth: '100%',
                backgroundColor: '#f8fafc'
              }
            }}
          />
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <FaUndo className="mr-2" />
            Effacer
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <FaSave className="mr-2" />
            Valider la signature
          </button>
        </div>

        {/* Date de signature */}
        <div className="text-sm text-gray-500 text-right">
          Date : {new Date().toLocaleDateString('fr-FR')}
        </div>
      </div>
    </div>
  );
};

export default SignatureSection;
