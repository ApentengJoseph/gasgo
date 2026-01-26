import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Address } from './schemas/address.schema';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(@InjectModel(Address.name) private addressModel: Model<Address>) {}

  async create(createAddressDto: CreateAddressDto, userId: string) {
    // If this is set as default, unset other defaults
    if (createAddressDto.isDefault) {
      await this.addressModel.updateMany(
        { userId },
        { $set: { isDefault: false } },
      );
    }

    return this.addressModel.create({
      ...createAddressDto,
      userId,
    });
  }

  async findByUserId(userId: string) {
    return this.addressModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
  }

  async findById(id: string) {
    const address = await this.addressModel.findById(id);
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return address;
  }

  async update(id: string, updateAddressDto: UpdateAddressDto) {
    const address = await this.addressModel.findById(id);
    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // If setting as default, unset other defaults
    if (updateAddressDto.isDefault) {
      await this.addressModel.updateMany(
        { userId: address.userId, _id: { $ne: id } },
        { $set: { isDefault: false } },
      );
    }

    return this.addressModel.findByIdAndUpdate(id, updateAddressDto, {
      new: true,
    });
  }

  async delete(id: string) {
    const address = await this.addressModel.findByIdAndDelete(id);
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return { success: true };
  }
}
