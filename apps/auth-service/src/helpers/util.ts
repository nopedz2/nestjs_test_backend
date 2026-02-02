import * as bcrypt from 'bcrypt';

const saltRounds = 10;

export const hashPasswordHelpers = async (plainPassword: string) => {
  try {
    return await bcrypt.hash(plainPassword, saltRounds);
  } catch (error) {
    console.log(error);
  }
};

export const comparePasswordHelpers = async (plainPassword: string, hashedPassword: string) => { 
  try {
    return await bcrypt.compareSync(plainPassword, hashedPassword); // Sử dụng compareSync để so sánh đồng bộ giữa mật khẩu thường và đã băm
  } catch (error) {
    console.log(error);
  }
};

// export const comparePassword = async (
//   plainPassword: string,
//   hashedPassword: string,
// ) => {
//   try {
//     return await bcrypt.compare(plainPassword, hashedPassword);
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };