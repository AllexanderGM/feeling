package com.feeling.packages.booking.infrastructure.repositories;

import com.feeling.packages.booking.infrastructure.entities.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IPaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
}
