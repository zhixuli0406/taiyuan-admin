import LoginPage, {
  Username,
  Password,
  Submit,
  Title,
  Logo,
} from "@react-login-page/page6";
import LoginLogo from "react-login-page/logo-rect";
import { ToastContainer, toast } from "react-toastify";
import { adminApi } from "../core/api";

const SigninPage = () => {
  const handleSubmit = async (even) => {
    even.preventDefault();
    const formData = new FormData(even.target);
    const data = Object.fromEntries(formData);
    const email = data.userUserName;
    const password = data.userPassword;
    if (email.length === 0 && password.length === 0) {
      toast.error("請輸入帳號密碼");
      return;
    }
    try {
      const response = await adminApi.login(email, password);
      console.log('登入響應:', response);
      if (response.token) {
        localStorage.setItem("token", response.token);
        window.location.href = "/";
      } else {
        toast.error("登入失敗：未收到令牌");
      }
    } catch (error) {
      console.error('登入錯誤:', error);
      if (error.response) {
        const { status, data } = error.response;
        if (status === 401) {
          toast.error(data.message || "帳號或密碼錯誤");
        } else {
          toast.error(data.message || "登入失敗");
        }
      } else {
        toast.error("登入失敗，請檢查網路連接");
      }
    }
  };

  return (
    <div style={{ height: "100vh" }}>
      <form onSubmit={handleSubmit} style={{ height: "100vh" }}>
        <LoginPage style={{height:"100vh",width:"100vw"}}>
          <Username label="帳號" placeholder="請輸入帳號" name="userUserName" />
          <Password label="密碼" placeholder="請輸入密碼" name="userPassword" />
          <Submit>
            登入
          </Submit>
          <Title />
          <Logo>
            <LoginLogo />
          </Logo>
        </LoginPage>
      </form>
      <ToastContainer />
    </div>
  );
};

export default SigninPage;
