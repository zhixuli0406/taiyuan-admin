import LoginPage, {
  Username,
  Password,
  Submit,
  Title,
  Logo,
} from "@react-login-page/page6";
import LoginLogo from "react-login-page/logo-rect";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

const SigninPage = () => {
  const handleSubmit = async (even) => {
    even.preventDefault();
    const formData = new FormData(even.target);
    const data = Object.fromEntries(formData);
    const username = data.userUserName;
    const password = data.userPassword;
    if (username.length === 0 && password.length === 0) {
      toast.error("請輸入帳號密碼");
      return;
    }
    try {
      const url = window.api + "/admin/login";
      const response = await axios({
        url: url,
        method: "post",
        data: {
          email: username,
          password: password,
        },
      });
      if (response.status === 200) {
        window.location.href = "/";
        localStorage.setItem("token", response.data.token);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.error);
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
