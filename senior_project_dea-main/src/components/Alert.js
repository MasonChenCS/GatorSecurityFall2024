import React, { useState } from "react";
import { Alert as AlertMaterial, AlertTitle } from "@mui/material";
import { Slide, Button } from "@mui/material";
import "./componentStyling/Alert.css";

export const Alert = () => {
    const [isAlertVisible, setAlertVisible] = useState(false);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [variant, setVariant] = useState("");
    const [continueCallback, setContinueCallback] = useState(null);

    const showMessage = () => setAlertVisible(true);
    const hideMessage = () => setAlertVisible(false);

    const getProps = ({ variant, title, message, continueCallback = null }) => {
        setVariant(variant);
        setTitle(title);
        setMessage(message);
        setContinueCallback(() => continueCallback);
        showMessage();
    };

    const AlertMessage = () => {
      const onCloseHandler = continueCallback ? null : hideMessage;
        return (
            <Slide direction="right" in={isAlertVisible}>
                <AlertMaterial onClose={onCloseHandler} severity={variant}>
                    <AlertTitle>{title}</AlertTitle>
                    {message.split('\n').map((line, index) => (
                        <span key={index}>
                            {line}
                            <br />
                        </span>
                    ))}
                    {continueCallback && (
                        <Button
                            variant="contained"
                            color="primary"
                            style={{ backgroundColor: "#2C74B3", marginTop: "10px" }}
                            onClick={continueCallback}
                        >
                            Continue
                        </Button>
                    )}
                </AlertMaterial>
            </Slide>
        );
    };

    return [AlertMessage, isAlertVisible, getProps, setAlertVisible];
};
