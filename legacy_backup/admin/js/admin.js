document.addEventListener('DOMContentLoaded', () => {
    const adminProductsBody = document.getElementById('adminProductsBody');

    // Hàm format tiền tệ VNĐ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const renderAdminProducts = () => {
        adminProductsBody.innerHTML = '';
        
        products.forEach((product) => {
            const tr = document.createElement('tr');
            
            // Fix path from admin context back to root
            const imagePath = product.image.startsWith('assets') ? '../' + product.image : product.image;

            tr.innerHTML = `
                <td>
                    <img src="${imagePath}" class="product-img-td" alt="${product.name}" onerror="this.src='https://via.placeholder.com/40'">
                </td>
                <td style="font-weight: 500;">${product.name}</td>
                <td><span style="background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem;">${product.categoryName}</span></td>
                <td>${formatCurrency(product.price)}</td>
                <td><span class="status-badge status-active">● Active</span></td>
                <td>
                    <button class="action-btn"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            adminProductsBody.appendChild(tr);
        });
    };

    renderAdminProducts();
});
