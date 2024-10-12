import { useState } from "react";
import { Alert as AlertMaterial, AlertTitle } from "@material-ui/lab";
import { Slide } from "@material-ui/core";
import "./componentStyling/Alert.css";

export const Alert = () => {
  const [isAlertVisible, setAlertVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("");

  const showMessage = () => setAlertVisible(true);
  const hideMessage = () => setAlertVisible(false);

  const getProps = ({ variant, title, message }) => {
    // console.log(variant, message);
    // There are 4 variants: success, info, warning, error
    setVariant(variant);
    setTitle(title);
    setMessage(message);
    showMessage();
  };

  const AlertMessage = () => {
    return (
      <Slide direction="right" in={isAlertVisible}>
        <AlertMaterial onClose={hideMessage} severity={variant}>
            <AlertTitle>
                {title}
            </AlertTitle>
            {message}
        </AlertMaterial>
      </Slide>
    );
  };

  return [AlertMessage, isAlertVisible, getProps, setAlertVisible];
};