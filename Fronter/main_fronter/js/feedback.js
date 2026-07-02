// 文件路径: /home/ubuntu/ComputerDesign/Fronter/main_fronter/js/feedback.js
/**
 * 意见反馈功能
 */

// 初始化意见反馈功能
function initFeedback() {
  // 获取DOM元素
  const feedbackButton = document.getElementById('feedback-button');
  const feedbackOverlay = document.getElementById('feedback-overlay');
  const feedbackForm = document.getElementById('feedback-form');
  const feedbackClose = document.getElementById('feedback-close');
  const feedbackCancel = document.getElementById('feedback-cancel');
  const feedbackMessage = document.getElementById('feedback-message');

  // 显示反馈弹窗
  if (feedbackButton) {
    feedbackButton.addEventListener('click', function () {
      feedbackOverlay.style.display = 'flex';
    });
  }

  // 关闭反馈弹窗
  if (feedbackClose) {
    feedbackClose.addEventListener('click', function () {
      feedbackOverlay.style.display = 'none';
      resetForm();
    });
  }

  // 取消按钮
  if (feedbackCancel) {
    feedbackCancel.addEventListener('click', function () {
      feedbackOverlay.style.display = 'none';
      resetForm();
    });
  }

  // 点击遮罩层关闭弹窗
  if (feedbackOverlay) {
    feedbackOverlay.addEventListener('click', function (event) {
      if (event.target === feedbackOverlay) {
        feedbackOverlay.style.display = 'none';
        resetForm();
      }
    });
  }

  // 表单提交部分
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', function (event) {
      event.preventDefault();

      // 获取表单数据
      const content = document.getElementById('feedback-content').value.trim();
      const contact = document.getElementById('feedback-phone').value.trim(); // 获取联系方式
      const contentError = document.getElementById('feedback-content-error');

      // 验证内容是否为空
      if (!content) {
        contentError.innerText = '请输入反馈内容';
        contentError.style.display = 'block';
        return;
      } else {
        contentError.style.display = 'none';
      }

      // 准备提交的数据（修改为符合API要求的字段名）
      const data = {
        content: content,
        contact: contact  // 修改字段名为 contact，而不是 phone
      };

      // 发送API请求
      submitFeedback(data);
    });
  }


  // 重置表单
  function resetForm() {
    if (feedbackForm) {
      feedbackForm.reset();
      document.getElementById('feedback-content-error').style.display = 'none';
      feedbackMessage.style.display = 'none';
    }
  }
  // 提交反馈到API
  function submitFeedback(data) {

    // 检查用户是否已登录
    const userInfoStr = localStorage.getItem('userInfo');
    let headers = { 'Content-Type': 'application/json' };
    let loginStatus = { isLoggedIn: false, token: null };

    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        console.log('解析的用户信息:', userInfo); // 调试信息

        if (userInfo && userInfo.token) {
          loginStatus = {
            isLoggedIn: true,
            token: userInfo.token
          };
          console.log('用户已登录，token:', userInfo.token.substring(0, 10) + '...'); // 打印部分token
        } else {
          console.log('未找到有效token');
        }
      } catch (e) {
        console.error('解析用户信息失败', e);
      }
    }

    // 如果已登录，添加认证头
    if (loginStatus.isLoggedIn && loginStatus.token) {
      headers['Authorization'] = `Bearer ${loginStatus.token}`;
      console.log('已添加认证头:', headers['Authorization']); // 调试信息
    }



    fetch('http://localhost:8000/api/feedback', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    })
      .then(response => {
        // 添加更详细的错误处理
        if (!response.ok) {
          // 记录状态码和状态文本，以便更好地诊断问题
          console.error(`HTTP 错误: ${response.status} ${response.statusText}`);

          // 尝试解析错误响应体
          return response.json().then(errorData => {
            // 记录详细错误信息
            console.error('API 错误详情:', errorData);
            throw new Error(`服务器错误 (${response.status}): ${errorData.detail || '未知错误'}`);
          }).catch(e => {
            // 如果无法解析 JSON，则抛出原始错误
            throw new Error(`网络错误 (${response.status}): ${response.statusText}`);
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('反馈提交成功:', data);
        // 显示成功消息
        feedbackMessage.innerText = '感谢您的反馈！我们会尽快处理。';
        feedbackMessage.style.display = 'block';
        feedbackMessage.style.backgroundColor = '#f6ffed';
        feedbackMessage.style.borderColor = '#b7eb8f';
        feedbackMessage.style.color = '#52c41a';

        // 3秒后关闭弹窗
        setTimeout(() => {
          feedbackOverlay.style.display = 'none';
          resetForm();
        }, 3000);
      })
      .catch(error => {
        console.error('提交反馈时出错:', error);

        // 根据错误类型显示不同的错误信息
        let errorMessage = '提交失败，请稍后再试。';

        // 如果是 401 错误，提示用户登录
        if (error.message.includes('(401)')) {
          errorMessage = '请先登录后再提交反馈。<a href="../login/index.html" style="color:#1890ff">去登录</a>';
        } else if (error.message.includes('服务器错误')) {
          errorMessage = error.message; // 使用服务器返回的详细错误信息
        }

        // 显示错误消息
        feedbackMessage.innerHTML = errorMessage;
        feedbackMessage.style.backgroundColor = '#fff2f0';
        feedbackMessage.style.borderColor = '#ffccc7';
        feedbackMessage.style.color = '#ff4d4f';
        feedbackMessage.style.display = 'block';
      });
  }

}

// 当文档加载完成时初始化意见反馈功能
document.addEventListener('DOMContentLoaded', initFeedback);