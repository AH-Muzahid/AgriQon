import { ReviewRepository } from './review.repository';
import { AppError } from '../../errors/AppError';

export class ReviewService {
  private reviewRepo: ReviewRepository;

  constructor() {
    this.reviewRepo = new ReviewRepository();
  }

  async createReview(businessId: string, userId: string, data: any) {
    const { itemId, rating, comment } = data;

    // Check if user already reviewed this item
    const existingReview = await this.reviewRepo.findByUserAndItem(userId, itemId, businessId);
    if (existingReview) {
      throw new AppError('You have already reviewed this item', 400);
    }

    return this.reviewRepo.create({
      businessId,
      userId,
      itemId,
      rating,
      comment,
    });
  }

  async getReviewsByItem(itemId: string, businessId: string) {
    return this.reviewRepo.findByItem(itemId, businessId);
  }

  async getAllReviews(businessId: string) {
    return this.reviewRepo.findAll(businessId);
  }

  async updateReview(id: string, businessId: string, userId: string, data: any) {
    const review = await this.reviewRepo.findById(id, businessId);
    if (!review) {
      throw new AppError('Review not found', 404);
    }

    // Only the author can update the review
    if (review.userId !== userId) {
      throw new AppError('Unauthorized to update this review', 403);
    }

    return this.reviewRepo.update(id, businessId, data);
  }

  async deleteReview(id: string, businessId: string, userId: string, isModerator: boolean) {
    const review = await this.reviewRepo.findById(id, businessId);
    if (!review) {
      throw new AppError('Review not found', 404);
    }

    // Author can always delete their own review; moderators can delete any review
    if (review.userId !== userId && !isModerator) {
      throw new AppError('Unauthorized to delete this review', 403);
    }

    return this.reviewRepo.delete(id, businessId);
  }
}
