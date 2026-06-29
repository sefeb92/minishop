const Contact = () => {
  return (
    <>
      <div className="page-header">
        <h1>Liên hệ</h1>
        <p>Kết nối với chúng tôi.</p>
      </div>
      <section className="contact-content" style={{ padding: '40px 0', maxWidth: '600px', margin: '0 auto' }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" placeholder="Họ và tên" className="form-control" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          <input type="email" placeholder="Email" className="form-control" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          <textarea placeholder="Tin nhắn" rows="5" className="form-control" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}></textarea>
          <button type="submit" className="btn btn-primary">Gửi tin nhắn</button>
        </form>
      </section>
    </>
  );
};

export default Contact;
