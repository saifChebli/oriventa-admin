import { Modal, Descriptions, Tag, Button } from "antd";
import dayjs from "dayjs";

const statusColors = {
  pending: "orange",
  accepted: "green",
  refuse: "red",
};

const ResumeDetailsModal = ({ open, onClose, resume }) => {
  if (!resume) return null;

  const handleDownload = (file) => {
    const url = `http://localhost:8000/api/clients/download/${file}`;
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", file);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <Modal
      title={`Resume #${resume._id}`}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={{
        xs: "90%",
        sm: "80%",
        md: "70%",
        lg: "60%",
        xl: "50%",
        xxl: "40%",
      }}
      style={{overflowY: "auto", maxHeight: "80vh"}}
    >
      <Descriptions bordered column={1} size="middle" labelStyle={{ fontWeight: 600 }}>
        <Descriptions.Item label="Nom Complet">{resume.fullName}</Descriptions.Item>
        <Descriptions.Item label="Email">{resume.email}</Descriptions.Item>
        <Descriptions.Item label="Téléphone">{resume.phone}</Descriptions.Item>
        <Descriptions.Item label="Adresse">{resume.address}</Descriptions.Item>
        <Descriptions.Item label="Date de Naissance">
          {dayjs(resume.birthDate).format("DD MMM YYYY")}
        </Descriptions.Item>

        <Descriptions.Item label="Expériences Professionnelles">
          <ul className="list-disc pl-5">
            {resume.exp1 && <li>{resume.exp1}</li>}
            {resume.exp2 && <li>{resume.exp2}</li>}
            {resume.exp3 && <li>{resume.exp3}</li>}
          </ul>
        </Descriptions.Item>

        <Descriptions.Item label="Langues">{resume.languages}</Descriptions.Item>
        <Descriptions.Item label="Diplômes">{resume.diplomas}</Descriptions.Item>
        {resume.stages && <Descriptions.Item label="Stages">{resume.stages}</Descriptions.Item>}
        {resume.associations && <Descriptions.Item label="Associations">{resume.associations}</Descriptions.Item>}
        <Descriptions.Item label="Compétences">{resume.skills}</Descriptions.Item>

        <Descriptions.Item label="Type de CVs">
          {Object.entries(resume.cvTypes || {}).map(([type, files]) => (
            <div key={type} className="mb-2">
              <strong>{type.charAt(0).toUpperCase() + type.slice(1)}:</strong>
              <ul className="list-disc pl-5">
                {files.map((file) => (
                  <li key={file}>
                    {file}{" "}
                    {/* <Button size="small" onClick={() => handleDownload(file)}>
                      Télécharger
                    </Button> */}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Descriptions.Item>

        <Descriptions.Item label="Reçu de Paiement">
          {resume.paymentReceipt ? (
            <Button onClick={() => handleDownload(resume.paymentReceipt)}>Télécharger le reçu</Button>
          ) : (
            "N/A"
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Status">
          <Tag color={statusColors[resume.status]}>{resume.status.toUpperCase()}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Remarks">{resume.remarks || "N/A"}</Descriptions.Item>
        <Descriptions.Item label="Date de soumission">
          {dayjs(resume.createdAt).format("DD MMM YYYY")}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ResumeDetailsModal;
