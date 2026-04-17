import { IsNotEmpty } from "class-validator";

export class ChangePasswordAuthDto {
    @IsNotEmpty({ message: 'Old password is required' })
    oldPassword: string;
    @IsNotEmpty({ message: 'New password is required' })
    newPassword: string;
}