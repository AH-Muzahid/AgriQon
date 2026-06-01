import { UserRepository } from '../src/app/modules/auth/user.repository';
import { AuthService } from '../src/app/modules/auth/auth.service';

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);

async function main() {
  try {
    const result = await authService.login({
      email: 'brooke94@gmail.com',
      password: 'password123'
    });
    console.log('Login Result:', result.user.name, 'Role:', result.user.role);
  } catch (err: any) {
    console.error('Login Failed:', err.message);
  }
}

main();
