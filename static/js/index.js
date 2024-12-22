document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('searchBtn');
    const udidInput = document.getElementById('udidInput');
    const loading = document.getElementById('loading');
    const resultContainer = document.getElementById('resultContainer');
    const errorMessage = document.getElementById('errorMessage');
    
    const fields = ['model', 'deviceNumber', 'devicePlatform', 'deviceClass', 'serialNumber'];
    
    // 显示错误信息
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000); // 3秒后自动隐藏
    }
    
    // 重置界面状态
    function resetUI() {
        errorMessage.style.display = 'none';
        resultContainer.style.display = 'none';
        resultContainer.classList.remove('active');
        loading.classList.remove('active');
    }
    
    // 设置加载状态
    function setLoading(isLoading) {
        searchBtn.disabled = isLoading;
        udidInput.disabled = isLoading;
        loading.style.display = isLoading ? 'block' : 'none';
        
        if (isLoading) {
            setTimeout(() => loading.classList.add('active'), 10);
        } else {
            loading.classList.remove('active');
        }
    }
    
    async function searchDevice(udid) {
        resetUI();
        setLoading(true);
        
        try {
            const response = await fetch(`https://api.ahfi.cn/api/AppleDeviceInfo?udid=${encodeURIComponent(udid)}`);
            const data = await response.json();
            
            if (data.code === 200) {
                fields.forEach(field => {
                    const element = document.getElementById(field);
                    const value = data.data[field] || '-';
                    element.textContent = value;
                    
                    // 只为有效值添加点击复制功能
                    if (value !== '-') {
                        element.addEventListener('click', () => {
                            const label = element.closest('.info-item').querySelector('.label').textContent;
                            copyToClipboard(value, label);
                        });
                    }
                });
                
                resultContainer.style.display = 'block';
                setTimeout(() => resultContainer.classList.add('active'), 10);
            } else if (data.code === 404) {
                showError('未找到设备信息，请检查UDID是否正确');
            } else {
                showError(data.message || '查询失败，请稍后重试');
            }
        } catch (error) {
            showError('网络错误，请检查网络连接后重试');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }
    
    // UDID输入验证
    function validateUDID(udid) {
        // 移除长度限制，只检查是否包含有效字符
        // 允许数字、字母、横杠
        const udidPattern = /^[0-9A-Fa-f\-]+$/;
        return udidPattern.test(udid);
    }
    
    searchBtn.addEventListener('click', () => {
        const udid = udidInput.value.trim();
        if (!udid) {
            showError('请输入UDID');
            return;
        }
        
        if (!validateUDID(udid)) {
            showError('请输入有效的UDID（40位十六进制字符）');
            return;
        }
        
        searchDevice(udid);
    });
    
    udidInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
    
    // 输入时隐藏错误信息
    udidInput.addEventListener('input', () => {
        errorMessage.style.display = 'none';
    });
    
    // 设置页脚年份
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // 添加复制功能
    const copyToast = document.getElementById('copyToast');
    let toastTimeout;
    
    function showToast(text) {
        copyToast.textContent = `已复制${text}`;
        copyToast.classList.add('show');
        
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            copyToast.classList.remove('show');
        }, 1500);
    }
    
    async function copyToClipboard(text, label) {
        try {
            await navigator.clipboard.writeText(text);
            showToast(label);
        } catch (err) {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast(label);
        }
    }
}); 