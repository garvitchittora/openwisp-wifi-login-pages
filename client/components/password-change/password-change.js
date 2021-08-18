import "react-toastify/dist/ReactToastify.css";

import axios from "axios";
import PropTypes from "prop-types";
import qs from "qs";
import React from "react";
import {toast} from "react-toastify";
import {Cookies} from "react-cookie";
import {t} from "ttag";
import PasswordToggleIcon from "../../utils/password-toggle";
import {passwordChangeApiUrl} from "../../constants";
import getErrorText from "../../utils/get-error-text";
import history from "../../utils/history";
import Contact from "../contact-box";
import LoadingContext from "../../utils/loading-context";
import logError from "../../utils/log-error";
import handleChange from "../../utils/handle-change";
import handleSession from "../../utils/session";

export default class PasswordChange extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newPassword1: "",
      newPassword2: "",
      errors: {},
      hidePassword: true,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.passwordToggleRef = React.createRef();
    this.confirmPasswordToggleRef = React.createRef();
  }

  componentDidMount() {
    const {setTitle, orgName} = this.props;
    setTitle(t`PWD_CHANGE_TITL`, orgName);
  }

  handleSubmit(e) {
    const {setLoading} = this.context;

    if (e) e.preventDefault();
    const {orgSlug, cookies} = this.props;
    const authToken = cookies.get(`${orgSlug}_auth_token`);
    const {token, session} = handleSession(orgSlug, authToken, cookies);
    const url = passwordChangeApiUrl.replace("{orgSlug}", orgSlug);
    const {newPassword1, newPassword2} = this.state;
    if (newPassword1 !== newPassword2) {
      this.setState({
        errors: {
          newPassword2: t`PWD_CNF_ERR`,
        },
      });
      return null;
    }
    setLoading(true);
    return axios({
      method: "post",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      url,
      data: qs.stringify({
        newPassword1,
        newPassword2,
        token,
        session,
      }),
    })
      .then((response) => {
        toast.success(response.data.detail);
        setLoading(false);
        history.replace(`/${orgSlug}/status`);
      })
      .catch((error) => {
        const errorText = getErrorText(error, t`PWD_CHNG_ERR`);
        logError(error, errorText);
        toast.error(errorText);
        setLoading(false);
        this.setState({
          errors: {
            nonField: t`PWD_CHNG_ERR`,
          },
        });
      });
  }

  handleChange(event) {
    handleChange(event, this);
  }

  render() {
    const {passwordChange} = this.props;
    const {errors, newPassword1, newPassword2, hidePassword} = this.state;
    return (
      <div className="container content" id="password-change">
        <div className="inner">
          <form className="main-column" onSubmit={this.handleSubmit}>
            <div className="inner">
              <h1>{t`PWD_CHANGE_TITL`}</h1>

              {errors.nonField && (
                <div className="error">
                  <span className="icon">!</span>
                  <span className="text">{errors.nonField}</span>
                </div>
              )}

              <div className="row password">
                <label htmlFor="password">{t`PWD1_LBL`}</label>

                {errors.newPassword1 && (
                  <div className="error">
                    <span className="icon">!</span>
                    <span className="text">{errors.newPassword1}</span>
                  </div>
                )}

                <input
                  className="input"
                  type="password"
                  id="password"
                  name="newPassword1"
                  required
                  value={newPassword1}
                  placeholder={t`PWD1_PHOLD`}
                  pattern={passwordChange.input_fields.password1.pattern}
                  title={t`PWD_PTRN_DESC`}
                  onChange={(e) => this.handleChange(e)}
                  ref={this.passwordToggleRef}
                  autoComplete="new-password"
                />
                <PasswordToggleIcon
                  inputRef={this.passwordToggleRef}
                  secondInputRef={this.confirmPasswordToggleRef}
                  hidePassword={hidePassword}
                  toggler={() => this.setState({hidePassword: !hidePassword})}
                />
              </div>

              <div className="row password-confirm">
                <label htmlFor="password-confirm">{t`CONFIRM_PWD_LBL`}</label>

                {errors.newPassword2 && (
                  <div className="error">
                    <span className="icon">!</span>
                    <span className="text">{errors.newPassword2}</span>
                  </div>
                )}

                <input
                  className="input"
                  type="password"
                  name="newPassword2"
                  id="password-confirm"
                  required
                  value={newPassword2}
                  placeholder={t`CONFIRM_PWD_PHOLD`}
                  pattern={passwordChange.input_fields.password1.pattern}
                  title={t`PWD_PTRN_DESC`}
                  onChange={(e) => this.handleChange(e)}
                  ref={this.confirmPasswordToggleRef}
                  autoComplete="new-password"
                />
                <PasswordToggleIcon
                  inputRef={this.confirmPasswordToggleRef}
                  secondInputRef={this.passwordToggleRef}
                  hidePassword={hidePassword}
                  toggler={() => this.setState({hidePassword: !hidePassword})}
                />
              </div>

              <div className="row submit">
                <input
                  type="submit"
                  className="button full"
                  value={t`PASSWORD_CHANGE`}
                />
              </div>
            </div>
          </form>

          <Contact />
        </div>
      </div>
    );
  }
}
PasswordChange.contextType = LoadingContext;
PasswordChange.propTypes = {
  orgSlug: PropTypes.string.isRequired,
  orgName: PropTypes.string.isRequired,
  cookies: PropTypes.instanceOf(Cookies).isRequired,
  passwordChange: PropTypes.shape({
    input_fields: PropTypes.shape({
      password1: PropTypes.shape({
        pattern: PropTypes.string.isRequired,
      }).isRequired,
      password2: PropTypes.shape({
        pattern: PropTypes.string,
      }).isRequired,
    }),
  }).isRequired,
  setTitle: PropTypes.func.isRequired,
};
