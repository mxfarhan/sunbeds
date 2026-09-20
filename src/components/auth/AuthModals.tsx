import { useEffect, useState } from 'react'
import SigninModal from './SigninModal'
import RegisterModal from './RegisterModal'
import ForgotPassModal from './ForgotPassModal'
import OtpModal from './OtpModal'
import { RegisterUserDataProvider } from '@/contexts/RegisterUserData'
import { useDispatch, useSelector } from 'react-redux'
import ResetPassModal from './ResetPassModal'
import { isLoginModalOpenSelector, setLoginModalState } from '@/redux/reducers/helpersReducer'
import { settingsSelector } from '@/redux/reducers/settingsSlice'

export type modalTypes = "signin" | "register" | "forgotPass" | "otp" | "resetPass"

const AuthModals = () => {

    const dispatch = useDispatch();
    const isLoginModalOpen = useSelector(isLoginModalOpenSelector);
    const settingsData = useSelector(settingsSelector);
    const allowMethods = settingsData?.general_config?.allow_auth_methods ?? [];

    const [openModals, setOpenModals] = useState({
        sigin: false,
        register: false,
        forgotPass: false,
        otp: false,
        resetPass: false,
    });

    const [continueWithEmail, setContinueWithEmail] = useState<boolean>(true)

    useEffect(() => {
        if (allowMethods.length > 0 && !allowMethods.includes('phone')) {
            setContinueWithEmail(true);
        }
    }, [allowMethods]);

    const handleOpenModal = (modal: modalTypes) => {
        setOpenModals(prev => {
            const key = modal === 'signin' ? 'sigin' : modal;
            return { ...prev, [key]: true };
        });
    }

    const handleCloseModal = (modal: modalTypes) => {
        setOpenModals(prev => {
            const key = modal === 'signin' ? 'sigin' : modal;
            return { ...prev, [key]: false };
        });
    }

    useEffect(() => {
        if (isLoginModalOpen) {
            setOpenModals(prev => ({
                ...prev,
                sigin: true
            }));
            dispatch(setLoginModalState(false));
        }
    }, [isLoginModalOpen, dispatch])

    return (
        <RegisterUserDataProvider>
            <SigninModal openSigninModal={openModals.sigin} handleOpenModal={handleOpenModal} handleCloseModal={handleCloseModal} continueWithEmail={continueWithEmail} setContinueWithEmail={setContinueWithEmail} handleOpenRegisterModal={() => handleOpenModal('register')} hideTrigger />

            <RegisterModal openRegisterModal={openModals.register} setOpenRegisterModal={(open) => open ? handleOpenModal('register') : handleCloseModal('register')} handleCloseModal={handleCloseModal} handleOpenModal={handleOpenModal} continueWithEmail={continueWithEmail} setOpenOtpModal={() => handleOpenModal('otp')} />

            <OtpModal openOtpModal={openModals.otp} handleOpenModal={handleOpenModal} handleCloseModal={handleCloseModal} setOpenRegisterModal={() => handleOpenModal('register')} openResetPassModal={() => handleOpenModal('resetPass')} />

            <ForgotPassModal openForgotPassModal={openModals.forgotPass} handleOpenModal={handleOpenModal} handleCloseModal={handleCloseModal} setOpenOtpModal={() => handleOpenModal('otp')}
                continueWithEmail={continueWithEmail}
            />

            <ResetPassModal openResetPassModal={openModals.resetPass} handleCloseModal={() => handleCloseModal('resetPass')} />


        </RegisterUserDataProvider>
    )
}

export default AuthModals