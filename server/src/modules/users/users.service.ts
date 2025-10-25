import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { HashingService } from 'src/utils/services/hashing.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    //services or providers
    private readonly hashingService: HashingService,
  ) {}

  /** CREATE NEW USER */

  async createUser(createUser: CreateUserDto): Promise<User> {
    const { fullname, email, password } = createUser;
    // check if email already exists
    const existingEmail = await this.userRepository.findOne({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await this.hashingService.hash(password);

    // save user
    const newUser = this.userRepository.create({
      fullname,
      email,
      password,
    });
    const savedUser = await this.userRepository.save(newUser);

    return savedUser;
  }
}
