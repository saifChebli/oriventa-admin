import React from 'react'
import { Modal, Descriptions, Tag } from "antd";
import dayjs from "dayjs";
import api from "../../../../api";

const CandidatesDetailsModal = ({ open, onClose, dossier }) => {
      if (!dossier) return null;

return (
    <Modal
      title={`Dossier #${dossier.dossierCode || dossier._id}`}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
       width={{
          xs: '90%',
          sm: '80%',
          md: '70%',
          lg: '60%',
          xl: '50%',
          xxl: '40%',
        }}
        
    >
      <Descriptions
        bordered
        column={1}
        size="middle"
        labelStyle={{ fontWeight: 600 }}
      >
        <Descriptions.Item label="Nom Complet">
          {dossier.fullName || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {dossier.email || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Telephone">
          {dossier.phone}
        </Descriptions.Item>
        <Descriptions.Item label="Adresse">
          {dossier.address}
        </Descriptions.Item>
        <Descriptions.Item label="Date de naissance">
          {dossier.birthDate ? dayjs(dossier.birthDate).format("DD MMM YYYY") : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Métier">
          {dossier.jobType || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Expériences">
          {dossier.experiences} | {dossier.exp1} | {dossier.exp2} | {dossier.exp3}
        </Descriptions.Item>
        <Descriptions.Item label="Compétences">
          {dossier.skills}
        </Descriptions.Item>
        <Descriptions.Item label="Stages">
          {dossier.stages}
        </Descriptions.Item>
        <Descriptions.Item label="Langues">
          {dossier.languages || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Diplômes">
          {dossier.diplomas || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Associations">
          {dossier.associations || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Avez un CV">
          {dossier.hasCV}
        </Descriptions.Item>
        <Descriptions.Item label="Remarques">
          {dossier.remarks || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Pièces jointes">
          <div className="flex flex-wrap gap-3">
            {dossier.cvFile && (
              <a className="text-blue-600 underline" href={`${api.defaults.baseURL}${dossier.cvFile}`} target="_blank" rel="noreferrer">CV</a>
            )}
            {dossier.diplomasFiles && (
              <a className="text-blue-600 underline" href={`${api.defaults.baseURL}${dossier.diplomasFiles}`} target="_blank" rel="noreferrer">Diplômes</a>
            )}
            {dossier.passportPhoto && (
              <a className="text-blue-600 underline" href={`${api.defaults.baseURL}${dossier.passportPhoto}`} target="_blank" rel="noreferrer">Passeport</a>
            )}
            {dossier.photoPersonne && (
              <a className="text-blue-600 underline" href={`${api.defaults.baseURL}${dossier.photoPersonne}`} target="_blank" rel="noreferrer">Photo</a>
            )}
            {dossier.attestationsTravail && (
              <a className="text-blue-600 underline" href={`${api.defaults.baseURL}${dossier.attestationsTravail}`} target="_blank" rel="noreferrer">Attest. Travail</a>
            )}
            {dossier.attestationsStage && (
              <a className="text-blue-600 underline" href={`${api.defaults.baseURL}${dossier.attestationsStage}`} target="_blank" rel="noreferrer">Attest. Stage</a>
            )}
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="Check-in">
          {dayjs(dossier.createdAt).format("DD MMM YYYY")}
        </Descriptions.Item>
        {/* {dossier.notes && (
          <Descriptions.Item label="Notes">{dossier.notes}</Descriptions.Item>
        )} */}
      </Descriptions>
    </Modal>
  );
}

export default CandidatesDetailsModal