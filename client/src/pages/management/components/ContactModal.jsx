
import { Modal, Descriptions, Tag } from "antd";
import dayjs from "dayjs";



const ContactModal = ({ open, onClose, contact }) => {
  if (!contact) return null;

  return (
    <Modal
      title={`Contact #${contact.contactCode || contact._id}`}
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
          {contact.name || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Telephone">
          {contact.phone}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {contact.email}
        </Descriptions.Item>
        <Descriptions.Item label="Message">
          {contact.message}
        </Descriptions.Item>
        <Descriptions.Item label="Check-in">
          {dayjs(contact.createdAt).format("DD MMM YYYY")}
        </Descriptions.Item>
        {/* {reservation.notes && (
          <Descriptions.Item label="Notes">{reservation.notes}</Descriptions.Item>
        )} */}
      </Descriptions>
    </Modal>
  );
};

export default ContactModal;
