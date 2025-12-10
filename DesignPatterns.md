# 🧩 Design Patterns Used in Chapter 4

This document describes the software design patterns applied in the **Chapter 4** online bookstore project.  
Patterns are categorized separately for the **Backend (.NET)** and **Frontend (React)** layers.

---

## 🚀 Backend (.NET + SQLite + EF Core)

| Pattern | Location | Description |
|--------|----------|-------------|
| **Repository Pattern** | `Backend/Repositories/BookRepository.cs`, `Backend/Repositories/UserRepository.cs` | Abstracts database operations, providing a clean interface for CRUD and query logic, improving separation of concerns. |
| **Dependency Injection (DI)** | `Backend/Program.cs`, `Backend/Startup.cs` | Services and repositories are injected into controllers, promoting loose coupling and easier testing. |
| **DTO (Data Transfer Object) Pattern** | `Backend/DTOs/BookDTO.cs`, `Backend/DTOs/UserDTO.cs` | Transfers data between layers without exposing internal entity models, ensuring secure API responses. |
| **Singleton Pattern (Optional)** | `Backend/Services/LoggerService.cs`, `Backend/Services/RecommendationEngineService.cs` | Ensures only one instance exists for services like logging or recommendations, maintaining consistent state and reducing resource usage. |

### ✔ Backend Summary

The backend architecture emphasizes:

- Modular structure with clear separation of concerns  
- Scalable and maintainable service layer design  
- Secure and reusable data handling through repositories and DTOs  

---

## 🎨 Frontend (React + Tailwind CSS + Axios)

| Pattern | Location | Description |
|--------|----------|-------------|
| **Container–Presentational Component Pattern** | Pages in `/src/pages` and UI components in `/src/components` | Separates logic (containers) from UI (presentational components), promoting reusability and cleaner structure. |
| **Module Pattern** | `/src/modules/AuthModule`, `/src/modules/BooksModule`, `/src/modules/CartModule` | Encapsulates features into modules with state, components, and API calls, improving maintainability. |
| **Observer / Publish–Subscribe Pattern** | State management using Context API / Redux | Components react to state changes dynamically, e.g., cart updates or theme changes trigger UI updates. |
| **Singleton Pattern (API Service)** | `/src/services/ApiService.js` | Ensures only one instance of the API service exists, providing consistent configuration for Axios requests. |
| **Factory Pattern (Optional)** | `/src/components/BookCardFactory.js` | Dynamically renders book cards based on type (featured, trending, recommended), promoting flexible component creation. |

### ✔ Frontend Summary

The frontend architecture focuses on:

- Reusable components and hooks for clean code  
- Modular state management for predictable behavior  
- Scalable UI structure ready for future features  

---

### 📌 Conclusion

The Chapter 4 project integrates modern design patterns across both backend and frontend layers. These patterns promote:

- Cleaner, more maintainable code  
- Scalability for new features and modules  
- Separation of concerns between UI, business logic, and data  
- Secure and efficient data handling and API communication  

This structured approach ensures the system remains easy to extend and evolve as the platform grows.
