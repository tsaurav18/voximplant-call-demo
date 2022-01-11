import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Text,
  Image,
  View,
  TouchableHighlight,
  Modal,
} from 'react-native';
import {navigateTo} from '../navigation/RootNavigation';
import {useDispatch, useSelector} from 'react-redux';
import {loginAction} from '../../actions/Auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {APP_NAME, ACC_NAME} from './Constants';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {TextInput} from 'react-native';
import {Button} from 'react-native-elements';
import styles from '../styles/LoginStyles';
import CallManager from '../manager/CallManager';
import LoginManager from '../manager/LoginManager';
import naver from '../../assets/images/naver.png';
import facebook from '../../assets/images/facebook.png';
import kakao from '../../assets/images/kakao.png';
const Dummy = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalText, setModalText] = useState('');
  const [formData, setFormData] = useState({});
  const AuthReducer = useSelector(state => state.AuthReducer);
  const dispatch = useDispatch();
  useEffect(() => {
    // AsyncStorage.getItem('usernameValue').then(username => {
    //     this.setState({username: username});
    //   });
    LoginManager.getInstance().on('onConnectionFailed', reason => {
      onConnectionFailed(reason);
    });
    LoginManager.getInstance().on('onLoggedIn', displayName => {
      onLoggedIn(displayName);
    });
    LoginManager.getInstance().on('onLoginFailed', errorCode => {
      onLoginFailed(errorCode);
    });

    // Workaround to navigate to the IncomingCallScreen if a push notification was received in 'killed' state
    if (Platform.OS === 'android') {
      if (CallManager.getInstance().showIncomingCallScreen) {
        this.props.navigation.navigate('IncomingCall', {
          callId: CallManager.getInstance().call.callId,
          isVideo: null,
          from: CallManager.getInstance().call.getEndpoints()[0].displayName,
        });
      }
    }
    return () => {};
  }, []);
  const onLoginFailed = errorCode => {
    switch (errorCode) {
      case 401:
        setModalText('Invalid password');
        setIsModalOpen(true);
        break;
      case 403:
        setModalText('Account frozen');
        setIsModalOpen(true);
        break;

      case 404:
        setModalText('Invalid username');
        setIsModalOpen(true);
        break;

      case 701:
        setModalText('Token expired');
        setIsModalOpen(true);
        break;
      default:
      case 500:
        setModalText('Internal error');
        setIsModalOpen(true);
        break;
    }
  };
  const onLoggedIn = async displayName => {
    await AsyncStorage.setItem('usernameValue', displayName);

    await AsyncStorage.getItem('@user_token').then(token => {
      if (token) {
        this.props.navigation.navigate('HomeScreen');
      } else {
        this.props.navigation.navigate('LoginScreen');
      }
    });
  };

  onConnectionFailed = reason => {
    this.setState({
      isModalOpen: true,
      modalText: 'Failed to connect, check internet settings',
    });
  };
  const _loginToApp = async item => {
    try {
      const {arn, pass} = JSON.parse(item);
      const fqUsername = `${arn}@${APP_NAME}.${ACC_NAME}.voximplant.com`;
      LoginManager.getInstance().loginWithPassword(fqUsername, pass);
    } catch (e) {
      navigateTo('LoginScreen');
      console.log('error while getting user from storage: ', e);
    }
  };

  const setToken = async (token, user) => {
    if (token) {
      try {
        await AsyncStorage.setItem('@user_token', token);
        await AsyncStorage.setItem('@user', JSON.stringify(user));
        await AsyncStorage.getItem('@user_token').then(item => {
          if (item) {
            _loginToApp(item);
          }
        });
      } catch (error) {
        console.log(err);
      }
    }
  };

  useEffect(async () => {
    const _checkToken = async () => {
      await AsyncStorage.getItem('@user_token').then(item => {
        if (item) {
          _loginToApp(item);
        } else {
          const token = AuthReducer?.token;
          const user = AuthReducer?.user;
          setToken(token, user);
        }
      });
    };
    _checkToken();
    return () => {};
  }, [AuthReducer]);

  const _focusNextField = nextField => {
    refs[nextField].focus();
  };

  const _handleSubmit = () => {
    if (formData.email == null || formData.password == null) {
      alert('Enter login Fields');
    } else {
      dispatch(loginAction(formData));
    }
  };
  return (
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: '#F4F7F9',
          // justifyContent: 'center',
        }}>
        <View
          style={{
            marginTop: height / 6,

            alignItems: 'flex-start',
            padding: 20,
            marginHorizontal: 10,
          }}>
          <Text style={{color: '#154DEC', fontSize: 30}}>{'로그인'}</Text>
        </View>
        <View style={styles.form}>
          <View style={styles.inputcontainer}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
              }}>
              <TextInput
                style={{
                  color: Platform.OS === 'android' ? 'black' : 'black',
                  borderRadius: 10,
                  width: '100%',
                  backgroundColor: '#fff',
                  padding: 13,
                  borderWidth: 1,
                  borderColor: '#9DA9CE',
                }}
                underlineColorAndroid="transparent"
                placeholderTextColor="#6c6ee4"
                placeholder="Enter your email"
                value={this.state.emailInput}
                autoFocus={true}
                returnKeyType={'next'}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={() => _focusNextField('password')}
                onChangeText={text => {
                  setFormData({...formData, email: text});
                }}
                blurOnSubmit={false}
              />
            </View>
          </View>

          <View style={styles.inputcontainer}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
              }}>
              <TextInput
                style={{
                  color: 'black',
                  borderRadius: 10,
                  width: '100%',
                  backgroundColor: '#fff',
                  padding: 13,
                  borderWidth: 1,
                  borderColor: '#9DA9CE',
                }}
                // value={this.state.passInput}
                underlineColorAndroid="transparent"
                ref="password"
                placeholderTextColor="#6c6ee4"
                secureTextEntry={true}
                autoCorrect={false}
                placeholder="Password"
                onChangeText={text => {
                  setFormData({...formData, password: text});
                }}
                blurOnSubmit={true}
              />
            </View>
          </View>
          {AuthReducer?.logLoading && (
            <ActivityIndicator size="small" color="#154DEC" />
          )}
          {AuthReducer?.msg ? (
            <View style={styles.inputcontainer}>
              <View style={styles.errorBox}>
                <Text style={{color: '#fff'}}>{AuthReducer?.msg}</Text>
              </View>
            </View>
          ) : null}
          <View style={styles.inputcontainer}>
            <View style={{width: '100%'}}>
              <Button
                title={'로그인'}
                buttonStyle={{
                  borderRadius: 30,
                  backgroundColor: '#154DEC',
                  padding: 8,
                }}
                titleStyle={{
                  fontSize: RFPercentage(2.8),
                  color: '#fff',
                }}
                onPress={() => {
                  _handleSubmit();
                }}
              />
            </View>
          </View>
          <View style={{width: '100%', alignItems: 'center'}}>
            <Text
              onPress={() => {
                alert('working on it');
              }}
              style={{
                fontSize: RFPercentage(2.1),
                color: '#5C6990',
              }}>
              {'비밀번호 찾기'}/{' '}
              <Text
                onPress={() => {
                  navigateTo('CountrySelectScreen');
                }}
                style={{color: '#1F4DE1'}}>
                {' '}
                {'이메일 회원가입'}
              </Text>
            </Text>
          </View>
        </View>

        <View
          style={{
            width: '100%',
            flex: 1,
            position: 'relative',
            // bottom: height / 9,
            left: 0,
            bottom: -230,
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontSize: RFPercentage(2.1),
              color: '#5C6990',
            }}>
            또는
          </Text>
          <View
            style={{borderWidth: 0.5, marginVertical: 3, width: 200}}></View>
          <View
            style={{
              flexDirection: 'row',
            }}>
            <Image style={styles.tinyLogo} source={kakao} />
            <Image style={styles.tinyLogo} source={facebook} />
            <Image style={styles.tinyLogo} source={naver} />
          </View>
        </View>
        <Modal animationType="fade" transparent={true} visible={isModalOpen}>
          <TouchableHighlight
            onPress={e => setIsModalOpen(false)}
            style={styles.container}>
            <View style={[styles.container, styles.modalBackground]}>
              <View
                style={[
                  styles.innerContainer,
                  styles.innerContainerTransparent,
                ]}>
                <Text>{modalText}</Text>
              </View>
            </View>
          </TouchableHighlight>
        </Modal>
      </View>
    </>
  );
};

export default Dummy;

const styles = StyleSheet.create({});
