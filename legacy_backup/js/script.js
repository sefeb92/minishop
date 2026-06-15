document.addEventListener('DOMContentLoaded', () => {
  const productsGrid = document.getElementById('productsGrid');
  const filterButtons = document.querySelectorAll('.cat-pill');

  // Hàm render sản phẩm
  const renderProducts = (productsToRender) => {
      if (!productsGrid) return;
      productsGrid.innerHTML = ''; // Xóa nội dung cũ

      if (!productsToRender || productsToRender.length === 0) {
          productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 50px;">Không tìm thấy sản phẩm nào.</p>';
          return;
      }

      productsToRender.forEach(product => {
          const productCard = document.createElement('div');
          productCard.className = 'product-card';
          
          productCard.innerHTML = `
              <div class="badge-new">New</div>
              <button class="btn-wishlist"><i class="fa-regular fa-heart"></i></button>
              <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='https://via.placeholder.com/300?text=No+Image'" onclick="window.location.href='product-detail.html?id=${product.id}'" style="cursor:pointer;">
              <div class="product-info">
                  <h3 class="product-name" onclick="window.location.href='product-detail.html?id=${product.id}'" style="cursor:pointer;">${product.name}</h3>
                  <div class="product-price">${typeof formatCurrency === 'function' ? formatCurrency(product.price) : product.price + ' đ'}</div>
                  <p class="product-desc">${product.description}</p>
                  <button class="btn-detail" onclick="window.location.href='product-detail.html?id=${product.id}'">Xem chi tiết &rarr;</button>
              </div>
          `;
          
          productsGrid.appendChild(productCard);
      });
  };

  // Render sản phẩm nổi bật lúc đầu (chỉ lấy 8 sản phẩm đầu)
  if (typeof products !== 'undefined') {
      renderProducts(products.slice(0, 8));
  } else {
      console.error("Dữ liệu products chưa được tải.");
  }

  // Logic lọc danh mục
  if (filterButtons) {
      filterButtons.forEach(button => {
          button.addEventListener('click', () => {
              // Xóa class active ở tất cả nút
              filterButtons.forEach(btn => btn.classList.remove('active'));
              // Thêm class active cho nút được bấm
              button.classList.add('active');

              const category = button.getAttribute('data-category');
              
              if (typeof products !== 'undefined') {
                  if (category === 'all') {
                      renderProducts(products.slice(0, 8));
                  } else {
                      const filteredProducts = products.filter(p => p.category === category);
                      renderProducts(filteredProducts.slice(0, 8));
                  }
              }
          });
      });
  }

  // Slider Drag & Auto-slide Logic
  const slider = document.querySelector('.slider-mode');
  if (slider) {
      let isDown = false;
      let startX;
      let scrollLeft;

      slider.addEventListener('mousedown', (e) => {
          isDown = true;
          slider.style.cursor = 'grabbing';
          startX = e.pageX - slider.offsetLeft;
          scrollLeft = slider.scrollLeft;
      });
      
      slider.addEventListener('mouseleave', () => {
          isDown = false;
          slider.style.cursor = 'grab';
      });
      
      slider.addEventListener('mouseup', () => {
          isDown = false;
          slider.style.cursor = 'grab';
      });
      
      slider.addEventListener('mousemove', (e) => {
          if (!isDown) return;
          e.preventDefault();
          const x = e.pageX - slider.offsetLeft;
          const walk = (x - startX) * 2; // scroll-fast
          slider.scrollLeft = scrollLeft - walk;
      });

      // Hỗ trợ cuộn ngang bằng nút cuộn chuột (mouse wheel)
      slider.addEventListener('wheel', (e) => {
          e.preventDefault();
          slider.scrollLeft += e.deltaY;
      });
  }

  // Chức năng Tìm kiếm
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
      // Create suggestion container
      const searchContainer = searchInput.parentElement;
      const suggestionsBox = document.createElement('div');
      suggestionsBox.className = 'search-suggestions';
      searchContainer.appendChild(suggestionsBox);

      searchInput.addEventListener('input', (e) => {
          const query = e.target.value.trim().toLowerCase();
          
          if (!query) {
              suggestionsBox.classList.remove('show');
              return;
          }

          if (typeof products !== 'undefined') {
              const matches = products.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
              
              suggestionsBox.innerHTML = ''; // Clear old

              if (matches.length > 0) {
                  matches.forEach(p => {
                      const item = document.createElement('div');
                      item.className = 'suggestion-item';
                      
                      // Fix image path if we are inside admin/ or somewhere else, but for now it's fine.
                      const imagePath = p.image; 
                      
                      item.innerHTML = `
                          <img src="${imagePath}" class="suggestion-img" onerror="this.src='https://via.placeholder.com/40'">
                          <div class="suggestion-info">
                              <div class="suggestion-name">${p.name}</div>
                              <div class="suggestion-price">${typeof formatCurrency === 'function' ? formatCurrency(p.price) : p.price + ' đ'}</div>
                          </div>
                      `;
                      item.addEventListener('click', () => {
                          window.location.href = 'product-detail.html?id=' + p.id;
                      });
                      suggestionsBox.appendChild(item);
                  });
              } else {
                  suggestionsBox.innerHTML = '<div class="suggestion-empty">Không tìm thấy sản phẩm</div>';
              }
              suggestionsBox.classList.add('show');
          }
      });

      // Hide suggestions when clicking outside
      document.addEventListener('click', (e) => {
          if (!searchContainer.contains(e.target)) {
              suggestionsBox.classList.remove('show');
          }
      });

      searchInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
              const query = searchInput.value.trim();
              if (query) {
                  window.location.href = 'products.html?q=' + encodeURIComponent(query);
              }
          }
      });
  }
});
