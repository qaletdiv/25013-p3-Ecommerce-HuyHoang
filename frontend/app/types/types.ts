// "id": "p1",
// "name": "Áo thun nam basic",
// "slug": "ao-thun-nam-basic",
// "description": "Áo thun nam chất liệu cotton 100%, mềm mại, thoáng mát, phù hợp mặc hàng ngày.",
// "categoryId": "c1",
// "thumbnail": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
// "category": {
// "id": "c1",
// "name": "Thời trang nam",
// "slug": "thoi-trang-nam"
// },
// "variants": [
// {
// "id": "v1",
// "size": "S",
// "color": "Trắng",
// "price": 179000,
// "stock": 10
// },
export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    categoryId?: number;
    thumbnail: string;
    category: Category;
    variants: ProductVariant[];
    hot?: boolean;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
}

export interface ProductVariant {
    id: string;
    size: string;
    color: string;
    price: number;
    stock: number;
}
