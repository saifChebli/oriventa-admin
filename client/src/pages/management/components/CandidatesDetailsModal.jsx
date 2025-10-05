import React from 'react'
import { Modal, Descriptions, Tag } from "antd";
import dayjs from "dayjs";

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
        <Descriptions.Item label="Telephone">
          {dossier.phone}
        </Descriptions.Item>
        <Descriptions.Item label="Adresse">
          {dossier.address}
        </Descriptions.Item>
        <Descriptions.Item label="Date de naissance">
          {dossier.birthDate}
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
        <Descriptions.Item label="Avez un CV">
          {dossier.hasCV}
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