const express = require('express');
const router = express.Router();
const sequelize = require('../db/sequelize');
const OutputRequestModel = require('../models/OutputRequestModel');
const { createModels } = require('../models/material');

// 출고 요청 등록
router.post('/output-request', async (req, res) => {
    const {
        material_id, request_qty, requester_id, comment, department, business_location
    } = req.body;
    if (!material_id || !request_qty || !requester_id || !department || !business_location) {
        return res.status(400).json({ message: '필수 정보가 누락되었습니다.' });
    }
    try {
        const OutputRequest = OutputRequestModel(sequelize);
        const request = await OutputRequest.create({
            material_id,
            request_qty,
            requester_id,
            comment,
            department,
            business_location,
            status: '대기',
        });
        res.status(201).json({ message: '출고 요청이 등록되었습니다.', request });
    } catch (err) {
        console.error('출고 요청 등록 실패:', err);
        res.status(500).json({ message: '출고 요청 등록 중 오류가 발생했습니다.' });
    }
});

// 출고 요청 목록 조회
router.get('/output-request', async (req, res) => {
    const { status = '대기' } = req.query;
    try {
        const OutputRequest = OutputRequestModel(sequelize);
        const requests = await OutputRequest.findAll({
            where: { status },
            order: [['request_date', 'DESC']]
        });
        res.json({ requests });
    } catch (err) {
        console.error('출고 요청 목록 조회 실패:', err);
        res.status(500).json({ message: '출고 요청 목록 조회 중 오류가 발생했습니다.' });
    }
});

// 출고 요청 승인
router.post('/output-request/:id/approve', async (req, res) => {
    const { id } = req.params;
    const approver_id = req.body.approver_id || 'admin'; // 실제 구현시 로그인 정보에서 추출
    let transaction;
    try {
        const OutputRequest = OutputRequestModel(sequelize);
        const request = await OutputRequest.findByPk(id);
        if (!request) return res.status(404).json({ message: '출고 요청을 찾을 수 없습니다.' });
        if (request.status !== '대기') return res.status(400).json({ message: '이미 처리된 요청입니다.' });

        // 재고 체크 및 실제 출고 처리
        const { business_location, department, material_id, request_qty } = request;
        const { Product, Input, Output } = createModels(business_location, department);
        transaction = await sequelize.transaction();
        const totalInput = await Input.sum('quantity', { where: { material_id } });
        const totalOutput = await Output.sum('quantity', { where: { material_id } });
        const stock = (totalInput || 0) - (totalOutput || 0);
        if (request_qty > stock) {
            await transaction.rollback();
            return res.status(400).json({ message: `재고 부족. 현재 재고: ${stock}, 요청 수량: ${request_qty}` });
        }
        // 출고 등록
        await Output.create({
            material_id,
            quantity: request_qty,
            comment: request.comment,
            date: new Date(),
            department,
            business_location,
            user_id: request.requester_id,
        }, { transaction });
        // 요청 상태 변경
        await request.update({
            status: '승인',
            approver_id,
            approve_date: new Date(),
            updated_at: new Date()
        }, { transaction });
        await transaction.commit();
        res.json({ message: '출고 요청이 승인되어 출고 처리되었습니다.' });
    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error('출고 승인 실패:', err);
        res.status(500).json({ message: '출고 승인 처리 중 오류가 발생했습니다.' });
    }
});

// 출고 요청 반려
router.post('/output-request/:id/reject', async (req, res) => {
    const { id } = req.params;
    const { reason, approver_id } = req.body;
    if (!reason) return res.status(400).json({ message: '반려 사유를 입력해주세요.' });
    try {
        const OutputRequest = OutputRequestModel(sequelize);
        const request = await OutputRequest.findByPk(id);
        if (!request) return res.status(404).json({ message: '출고 요청을 찾을 수 없습니다.' });
        if (request.status !== '대기') return res.status(400).json({ message: '이미 처리된 요청입니다.' });
        await request.update({
            status: '반려',
            approver_id: approver_id || 'admin',
            approve_date: new Date(),
            reject_reason: reason,
            updated_at: new Date()
        });
        res.json({ message: '출고 요청이 반려되었습니다.' });
    } catch (err) {
        console.error('출고 반려 실패:', err);
        res.status(500).json({ message: '출고 반려 처리 중 오류가 발생했습니다.' });
    }
});

module.exports = router; 