import { Divider, Modal } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../../../api';

const CommentModal = ({ visible, onClose , consultation ,getBookings ,url }) => {
  if (!consultation) return null;

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
  const addNewComment = async () => {
    
    try {
      const response = await api.patch(`${url}/${consultation._id}`, { text: newComment } , { withCredentials: true });
   
      setNewComment('');

      getBookings()
      toast.success('Comment added successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add comment');
    }
  };

  return (
    <Modal
      title={`Consultation #${consultation.contactCode || consultation._id}`}
      open={visible}
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
        style={{overflowY: 'scroll' , maxHeight: '80vh'}}
    >
      <h1 className="text-2xl font-bold mb-4">Add Comment</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="">Comment</label>
        <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" name="" id=""></textarea>
      </div>
      <div>
        <button onClick={addNewComment} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200">Submit</button>
      </div>
      <Divider />

      <h1 className="text-2xl font-bold mb-4">All Comments</h1>
      {
        consultation?.comment?.map((comment) => (
          <div key={comment._id} className="mb-4 border border-gray-300 rounded-md p-4">
            <p className='mb-2'>Content : {comment.text}</p>
            <p className='mb-2'>Agent Email : {comment.writer.email}</p>
            <p className='mb-2'>Date :{dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm:ss')}</p>
          </div>
        ))
      }
      {
        consultation?.comment?.length === 0 && (
          <p className='text-center my-4 text-gray-500' >No comments yet</p>
        )
      }
    </Modal>
  )
}

export default CommentModal