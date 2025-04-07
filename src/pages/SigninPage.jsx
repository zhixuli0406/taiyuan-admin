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
      if (response.token) {
        window.location.href = "/";
        localStorage.setItem("token", response.token);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.error || "登入失敗");
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
