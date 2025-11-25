import express from 'express';
import { MessageRouters } from '../modules/messages/message.route';
import { AuthRouters } from '../modules/auth/auth.routes';
import { UserRouters } from '../modules/user/user.routes';
import { packageRouters } from '../modules/package/package.route';
import { FaqRouters } from '../modules/faq/faq.route';
import { InfoContentRouters } from '../modules/info-content/info-content.route';
import { SupportTicketRouters } from '../modules/support-ticket/support-ticket.route';
import { EventRouters } from '../modules/event/event.route';
import { MusicRouters } from '../modules/music/music.route';
import { CategoryRouters } from '../modules/category/category.route';
import { ProductRouters } from '../modules/product/product.route';
import { WishlistRouters } from '../modules/wishlist/wishlist.route';
import { SubscriptionRouters } from '../modules/subscription/subscription.route';
import { ReviewRouters } from '../modules/review/review.route';
import { NotificationRouters } from '../modules/notification/notification.route';
import { FollowRoutes } from '../modules/follow/follow.route';
import { ChatRoutes } from '../modules/chat/chat.route';
import { AssetRouters } from '../modules/asset/asset.route';
const router = express.Router();

const moduleRoutes = [
    {
        path: '/auth',
        route: AuthRouters,
    },
    {
        path: '/users',
        route: UserRouters,
    },
    {
        path: '/messages',
        route: MessageRouters,
    },
    {
        path: '/chats',
        route: ChatRoutes,
    },
    {
        path: '/notifications',
        route: NotificationRouters,
    },
    {
        path: '/assets',
        route: AssetRouters,
    },
    {
        path: '/categories',
        route: CategoryRouters,
    },
    {
        path: '/products',
        route: ProductRouters,
    },
    {
        path: '/events',
        route: EventRouters,
    },
    {
        path: '/music',
        route: MusicRouters,
    },
    {
        path: '/packages',
        route: packageRouters,
    },
    {
        path: '/subscriptions',
        route: SubscriptionRouters,
    },
    {
        path: '/faqs',
        route: FaqRouters,
    },
    {
        path: '/info-contents',
        route: InfoContentRouters,
    },
    {
        path: '/support-tickets',
        route: SupportTicketRouters,
    },
    {
        path: '/wishlists',
        route: WishlistRouters,
    },
    {
        path: '/reviews',
        route: ReviewRouters,
    },
    {
        path: '/follows',
        route: FollowRoutes,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
