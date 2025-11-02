
import { Modal, Descriptions, Tag } from "antd";
import dayjs from "dayjs";

const statusColors = {
  PENDING: "orange",
  ACCEPTED: "green",
  DECLINED: "red",
};

const DetailsModal = ({ open, onClose, reservation }) => {
  if (!reservation) return null;

  return (
    <Modal
      title={`Reservation #${reservation.reservationCode || reservation._id}`}
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
          {reservation.fullName || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Telephone">
          {reservation.phone}
        </Descriptions.Item>
        <Descriptions.Item label="Adresse">
          {reservation.address}
        </Descriptions.Item>
        <Descriptions.Item label="Domaine">
          {reservation.jobDomain}
        </Descriptions.Item>
        <Descriptions.Item label="Whatsapp">
          {reservation.whatsapp}
        </Descriptions.Item>
        <Descriptions.Item label="Années d'expérience">
          {reservation.experience}
        </Descriptions.Item>
        <Descriptions.Item label="Pays de destination">
          {reservation.destination}
        </Descriptions.Item>
        <Descriptions.Item label="Type de travail">
          {reservation.jobType}
        </Descriptions.Item>
        <Descriptions.Item label="Pourquoi travailler à l'étranger">
          {reservation.reason}
        </Descriptions.Item>
        <Descriptions.Item label="Informations supplémentaires">
          {reservation.extra || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Consentement RGPD">
          {typeof reservation.consent !== 'undefined' ? (reservation.consent ? 'Oui' : 'Non') : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Check-in">
          {dayjs(reservation.createdAt).format("DD MMM YYYY")}
        </Descriptions.Item>
        {/* {reservation.notes && (
          <Descriptions.Item label="Notes">{reservation.notes}</Descriptions.Item>
        )} */}
      </Descriptions>
    </Modal>
  );
};

export default DetailsModal;
