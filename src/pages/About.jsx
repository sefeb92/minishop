const About = () => {
  return (
    <>
      <div className="page-header">
        <h1>Về chúng tôi</h1>
        <p>Tìm hiểu thêm về Mini Shop và sứ mệnh của chúng tôi.</p>
      </div>
      <section className="about-content" style={{ padding: '40px 0', textAlign: 'center' }}>
        <h2>Sống đẹp mỗi ngày</h2>
        <p style={{ maxWidth: '600px', margin: '20px auto', lineHeight: '1.6' }}>
          Mini Shop được thành lập với mong muốn mang đến những sản phẩm trang trí và đồ gia dụng nội thất tốt nhất. 
          Chúng tôi tin rằng một không gian sống đẹp sẽ mang lại nguồn cảm hứng bất tận cho cuộc sống của bạn.
        </p>
      </section>
    </>
  );
};

export default About;
