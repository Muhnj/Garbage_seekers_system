import { userManager } from '@/libs/resourceManagement';
import Toast from "react-native-toast-message";

export const RewardPoints = async (id, points) => {
        try {
          const userData = await userManager.get(id);

          const newEcho = userData?.echoPoints + points;
          await userManager.updateResource(id, {echoPoints: newEcho});
          Toast.show({
              type: 'success',
              text1: 'Reward',
              text2: '+100 Echo point deposited on you account'
            })

            console.log('Points have been add successfully');
          
        } catch (error) {
          Toast.show({
            type: 'error',
            text1: 'Reward Issue',
            text2: 'Points will be reward later, Thank you'
          })
          console.log('Points faied: ', error);
        }
      }